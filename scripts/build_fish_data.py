#!/usr/bin/env python3
"""Reproducible source-specific conservative mask + contour/relative-flow sidecar.
No inference service, downloads, arbitrary emitters or use of motion as fish identity.
"""
import argparse,hashlib,json,time,subprocess
from pathlib import Path
import cv2
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def interpolate(track,f):
 keys=track['keyframes']
 a=max((k for k in keys if k['frame']<=f),key=lambda k:k['frame'],default=keys[0])
 b=min((k for k in keys if k['frame']>=f),key=lambda k:k['frame'],default=keys[-1])
 q=(f-a['frame'])/max(1,b['frame']-a['frame']);out={'valid':a.get('valid',True) and b.get('valid',True),'finTrusted':a.get('finTrusted',False) and b.get('finTrusted',False)}
 for name in ['body','fish','fins']:
  aa=np.array(a.get(name,[]),np.float32);bb=np.array(b.get(name,[]),np.float32)
  # Never interpolate unlike topology or silently use an absent polygon.
  out[name]=(aa*(1-q)+bb*q) if aa.shape==bb.shape else np.empty((0,2),np.float32)
 if np.array(a.get('body',[])).shape!=np.array(b.get('body',[])).shape or np.array(a.get('fish',[])).shape!=np.array(b.get('fish',[])).shape:out['valid']=False
 if np.array(a.get('fins',[])).shape!=np.array(b.get('fins',[])).shape:out['finTrusted']=False
 return out

def poly(points,w,h):
 m=np.zeros((h,w),np.uint8)
 if len(points)>=3:cv2.fillPoly(m,[np.rint(points).astype(np.int32)],1)
 return m

def rle(mask):
 a=np.pad(mask.ravel().astype(np.int8),(1,1));d=np.diff(a)
 starts=np.where(d==1)[0];ends=np.where(d==-1)[0]
 return np.column_stack([starts,ends-starts]).ravel().tolist()

def conservative(im,ann):
 raw=(im.max(2)>ann['threshold']).astype(np.uint8);raw[:ann['excludedTopRows']]=0
 count,labels,stats,_=cv2.connectedComponentsWithStats(raw,8)
 ids=[i for i in range(1,count) if stats[i,cv2.CC_STAT_AREA]>=120]
 m=np.isin(labels,ids).astype(np.uint8)
 # Move emission two analysis pixels INSIDE visible source, exclude codec halos.
 return cv2.erode(m,np.ones((3,3),np.uint8),iterations=2)

def fit_body(gray,nxt,body,mask):
 good=cv2.goodFeaturesToTrack(gray,150,.012,4,mask=(body*mask*255),blockSize=5)
 if good is None or len(good)<10:return None,0,0
 dest,status,_=cv2.calcOpticalFlowPyrLK(gray,nxt,good,None,winSize=(19,19),maxLevel=3)
 if dest is None:return None,0,0
 back,bs,_=cv2.calcOpticalFlowPyrLK(nxt,gray,dest,None,winSize=(19,19),maxLevel=3)
 keep=(status[:,0]>0)&(bs[:,0]>0)&(np.linalg.norm(back[:,0]-good[:,0],axis=1)<1.)
 a=good[keep,0];b=dest[keep,0]
 if len(a)<10:return None,0,len(a)
 aff,inliers=cv2.estimateAffinePartial2D(a,b,method=cv2.RANSAC,ransacReprojThreshold=1.2,maxIters=1000,confidence=.99)
 if aff is None:return None,0,len(a)
 conf=float(np.mean(inliers));err=float(np.median(np.linalg.norm(a@aff[:,:2].T+aff[:,2]-b,axis=1)))
 if conf<.65 or err>1:return None,0,len(a)
 return aff,conf,len(a)

def main():
 p=argparse.ArgumentParser();p.add_argument('--input',type=Path,default=ROOT/'public/media/local/loop30-v2.mp4');p.add_argument('--annotations',type=Path,default=ROOT/'public/media/local/fish-annotations.json');p.add_argument('--output',type=Path,default=ROOT/'public/media/local/fish-data.json');args=p.parse_args()
 cv2.setRNGSeed(41);cv2.setNumThreads(1)
 started=time.perf_counter();ann=json.loads(args.annotations.read_text());source_hash=sha(args.input)
 if source_hash!=ann['sourceSha256']:raise SystemExit('Source SHA mismatch; masks not built')
 cap=cv2.VideoCapture(str(args.input));fps=cap.get(cv2.CAP_PROP_FPS);count=int(cap.get(cv2.CAP_PROP_FRAME_COUNT));sw=int(cap.get(3));sh=int(cap.get(4));w=ann['width'];h=ann['height']
 if count!=ann['frameCount'] or fps!=ann['fps']:raise SystemExit('Source timing mismatch')
 small=[]
 for i in range(count):
  ok,im=cap.read()
  if not ok:raise SystemExit(f'Decode failed at {i}')
  small.append(cv2.resize(im,(w,h),interpolation=cv2.INTER_AREA))
 cap.release();masks=[conservative(im,ann) for im in small]
 frames=[];evidence=ROOT/'evidence/fish-bound-01';evidence.mkdir(parents=True,exist_ok=True)
 # Segmentation alternatives: motion and MOG2 lose stationary fish; measure support only.
 mog=cv2.createBackgroundSubtractorMOG2(history=90,varThreshold=16,detectShadows=False);alternatives=[]
 cap=cv2.VideoCapture(str(args.input));fin_coverage=[];failed=[];bodyfits=[]
 writer=cv2.VideoWriter(str(evidence/'mask-evidence-opencv.mp4'),cv2.VideoWriter_fourcc(*'mp4v'),fps,(w*2,h*2))
 sheets=[];stats=[]
 for f,im in enumerate(small):
  ok,native=cap.read()
  if not ok:raise SystemExit('RGB decode failure')
  nxt=small[(f+1)%count];gray=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY);ng=cv2.cvtColor(nxt,cv2.COLOR_BGR2GRAY);mask=masks[f].copy()
  active=[];finmask=np.zeros((h,w),np.uint8);bodyunion=np.zeros((h,w),np.uint8)
  for track in ann['tracks']:
   if not track['start']<=f<=track['end']:continue
   key=interpolate(track,f);body=poly(key['body'],w,h)
   if not key['valid']:
    cc,ll,_,_=cv2.connectedComponentsWithStats(mask)
    for ci in range(1,cc):
     if np.any((ll==ci)&(body>0)):mask[ll==ci]=0
    continue
   fish=poly(key['fish'],w,h)
   # User fish polygons refine their nearest component, never turn black pixels on.
   if len(key['fish'])>=3:
    cc,lab,ss,cent=cv2.connectedComponentsWithStats(mask)
    touched=[i for i in range(1,cc) if np.any((lab==i)&(body>0))]
    for i in touched:mask[(lab==i)&(fish==0)]=0
   bodyunion|=body
   core=cv2.erode(body,np.ones((9,9),np.uint8))
   aff,confidence,feature_count=fit_body(gray,ng,core,mask)
   guard=cv2.dilate(body,np.ones((13,13),np.uint8))
   explicit=poly(key['fins'],w,h)
   active.append({'id':track['id'],'body':body,'guard':guard,'fin':explicit,'manualFin':len(key['fins'])>=3,'aff':aff,'confidence':confidence,'trusted':key['finTrusted'],'features':feature_count,'center':np.mean(key['body'],axis=0) if len(key['body']) else np.array([-1000,-1000])})
  valid=(500<int(mask.sum())<w*h*.45) and f not in ann['disabledFrames']
  if not valid:mask[:]=0;failed.append(f)
  flow=cv2.calcOpticalFlowFarneback(gray,ng,None,.5,3,19,3,5,1.2,0)
  backward=cv2.calcOpticalFlowFarneback(ng,gray,None,.5,3,19,3,5,1.2,0)
  soft=cv2.GaussianBlur(mask.astype(np.float32),(7,7),1.5);gx=cv2.Sobel(soft,cv2.CV_32F,1,0);gy=cv2.Sobel(soft,cv2.CV_32F,0,1)
  contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
  total=sum(len(c) for c in contours if len(c)>15);samples=[];fincontours=[]
  for contour in contours:
   pts=contour[:,0];n=len(pts)
   if n<16:continue
   steps=max(4,round(64*n/max(1,total)))
   for j in range(steps):
    k=int((j+.5)*n/steps)%n;x,y=map(int,pts[k]);nvec=-np.array([gx[y,x],gy[y,x]],float);norm=np.linalg.norm(nvec)
    if norm<.01:continue
    nvec/=norm
    sx=min(sw-1,int((x+.5)*sw/w));sy=min(sh-1,int((y+.5)*sh/h));rgb=native[sy,sx,::-1]
    if int(rgb.max())<=ann['threshold']:continue
    local=np.median(flow[max(0,y-1):y+2,max(0,x-1):x+2].reshape(-1,2),axis=0)
    dest=np.rint(np.array([x,y])+local).astype(int);xx=int(np.clip(dest[0],0,w-1));yy=int(np.clip(dest[1],0,h-1));fb=float(np.linalg.norm(local+backward[yy,xx]));conf=max(0.,1-fb/1.8)
    track=None;best=1e9
    for a in active:
     dist=float(np.linalg.norm(a['center']-[x,y]))
     if dist<best:best=dist;track=a
    bodyv=np.zeros(2);rel=np.zeros(2);isfin=False;tid=0
    if track:
     tid=track['id'];aff=track['aff']
     if aff is not None:
      bodyv=aff[:,:2]@np.array([x,y])+aff[:,2]-[x,y];rel=local-bodyv
      conf*=track['confidence']
     else:conf=0
     isfin=bool(track['trusted'] and track['guard'][y,x]==0 and (not track['manualFin'] or track['fin'][y,x]))
     if isfin:fincontours.append([x,y])
    if np.linalg.norm(local)>5 or np.linalg.norm(rel)>4:conf=0
    # Normalized units / second, source coordinates remain integer pixels.
    bv=bodyv*np.array([fps/w,fps/h]);rv=rel*np.array([fps/w,fps/h])
    a=pts[(k-5)%n].astype(float)-pts[k];b=pts[(k+5)%n].astype(float)-pts[k]
    cosine=float(np.dot(a,b)/max(1,np.linalg.norm(a)*np.linalg.norm(b)));tip=1+max(0,cosine+.6)*1.2
    samples.append([x,y,*map(int,rgb),*np.round(nvec,4).tolist(),*np.round(bv,5).tolist(),*np.round(rv,5).tolist(),round(conf,3),int(isfin),tid,round(tip,3)])
  # Debug fin regions use exactly the same manual guard and fish mask as candidate labels.
  for a in active:
   if not a['trusted']:continue
   # Select connected fish nearest this body's overlap, to avoid cross-labeling the other fish during dissolves.
   cc,lab,ss,cent=cv2.connectedComponentsWithStats(mask)
   ids=[i for i in range(1,cc) if int(np.sum((lab==i)&(a['body']>0)))>100]
   region=np.isin(lab,ids)&(a['guard']==0)&(mask>0)
   if a['manualFin']:region&=a['fin']>0
   finmask[region]=1
  # A candidate may belong to another disconnected fish: require exact fin-region membership too.
  for s in samples:
   if not finmask[s[1],s[0]]:s[12]=0
  frames.append({'i':f,'valid':bool(valid),'rle':rle(mask),'finRle':rle(finmask),'p':samples})
  fin_coverage.append(sum(1 for s in samples if s[12] and s[11]>.35));bodyfits.append([f,[[a['id'],a['features'],round(a['confidence'],3)] for a in active]])
  fg=mog.apply(im);motion=(cv2.absdiff(gray,cv2.cvtColor(small[(f-1)%count],cv2.COLOR_BGR2GRAY))>6)
  if f%30==0:alternatives.append({'frame':f,'foregroundPixels':int(mask.sum()),'mogSupportFraction':round(float(((fg>0)&(mask>0)).sum()/max(1,mask.sum())),3),'motionSupportFraction':round(float((motion&(mask>0)).sum()/max(1,mask.sum())),3)})
  maskrgb=np.repeat((mask*255)[:,:,None],3,2);overlay=im.copy();overlay[finmask>0]=(overlay[finmask>0]*.45+np.array([170,225,20])*.55).astype(np.uint8)
  for a in active:
   co,_=cv2.findContours(a['body'],cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);cv2.drawContours(overlay,co,-1,(255,150,60),1)
  candidates=im.copy()
  for s in samples:cv2.circle(candidates,(s[0],s[1]),2,(30,240,255) if s[12] and s[11]>.35 else (160,80,240),-1)
  panels=[im,maskrgb,overlay,candidates];grid=np.zeros((h*2,w*2,3),np.uint8)
  for j,panel in enumerate(panels):
   panel=panel.copy();cv2.putText(panel,['SOURCE','CONSERVATIVE MASK','MANUAL FIN CANDIDATES / BODY GUARD','CANDIDATES (not actual births)'][j]+f'  f{f:03}',(10,h-12),cv2.FONT_HERSHEY_SIMPLEX,.45,(255,255,255),1);grid[j//2*h:(j//2+1)*h,j%2*w:(j%2+1)*w]=panel
  writer.write(grid)
  if f%30==0 or f in [15,45,479,495,510,899]:
   cv2.imwrite(str(evidence/f'mask-{f:03}.jpg'),grid);sheets.append((f,cv2.resize(grid,(640,360))))
  stats.append({'frame':f,'area':int(mask.sum()),'valid':bool(valid),'finCandidates':fin_coverage[-1]})
  if f%100==0:print(json.dumps({'frame':f,'seconds':round(time.perf_counter()-started,1),'finCandidates':fin_coverage[-1]}),flush=True)
 writer.release();cap.release()
 subprocess.run(['ffmpeg','-v','error','-i',str(evidence/'mask-evidence-opencv.mp4'),'-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart','-y',str(evidence/'mask-evidence.mp4')],check=True)
 out={'schema':2,'sourceSha256':source_hash,'annotationSha256':sha(args.annotations),'fps':fps,'duration':count/fps,'frameCount':count,'width':w,'height':h,'sourceWidth':sw,'sourceHeight':sh,'sampleFields':['x','y','r','g','b','nx','ny','bodyVx','bodyVy','relativeVx','relativeVy','confidence','finCandidate','trackId','tipWeight'],'method':'source-specific threshold24 + connected components + 2px erosion; manual interpolated body guards; Farneback local flow minus body LK/RANSAC similarity transform; forward/backward gate','limitation':'Conservative visible fish only, not transparent fin extent. Fin labels are manually guarded candidate regions, not learned semantic fin detection. No camera transform can be estimated from uniform black background. Weak/inconsistent residual motion suppresses C births.','frames':frames}
 args.output.write_text(json.dumps(out,separators=(',',':')))
 report={'sourceSha256':source_hash,'annotationSha256':out['annotationSha256'],'frames':count,'failedMaskFrames':failed,'finCandidatesPerFrame':{'min':min(fin_coverage),'median':float(np.median(fin_coverage)),'max':max(fin_coverage),'zeroFrames':[i for i,n in enumerate(fin_coverage) if n==0]},'segmentationAlternatives':alternatives,'bodyFits':bodyfits,'frameStats':stats,'seconds':round(time.perf_counter()-started,2),'dataBytes':args.output.stat().st_size,'method':out['method'],'limitations':out['limitation']}
 (evidence/'segmentation-report.json').write_text(json.dumps(report,indent=2))
 for page in range((len(sheets)+11)//12):
  sheet=np.zeros((360*4,640*3,3),np.uint8)
  for j,(f,im) in enumerate(sheets[page*12:page*12+12]):sheet[j//3*360:(j//3+1)*360,j%3*640:(j%3+1)*640]=im
  cv2.imwrite(str(evidence/f'mask-contact-{page}.jpg'),sheet)
 print(json.dumps({k:v for k,v in report.items() if k not in ['bodyFits','frameStats','segmentationAlternatives']},indent=2))
if __name__=='__main__':main()
