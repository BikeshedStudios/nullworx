#!/usr/bin/env python3
"""Offline fin edge motion relative to measured body transforms. Never writes 01.1 artifacts."""
from pathlib import Path
import argparse,json,hashlib,time,math
import cv2,numpy as np
from build_fish_data import interpolate,poly,rle
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'evidence/fin-motion-012'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def unrle(r):
 m=np.zeros(640*360,np.uint8)
 for i,n in zip(r[::2],r[1::2]):m[i:i+n]=1
 return m.reshape(360,640)
def at(im,p):
 x,y=p;x=float(np.clip(x,0,639));y=float(np.clip(y,0,359));x0=int(x);y0=int(y);dx=x-x0;dy=y-y0
 return (im[y0,x0]*(1-dx)*(1-dy)+im[y0,min(639,x0+1)]*dx*(1-dy)+im[min(359,y0+1),x0]*(1-dx)*dy+im[min(359,y0+1),min(639,x0+1)]*dx*dy)
def signed(mask):return cv2.distanceTransform(mask,cv2.DIST_L2,5)-cv2.distanceTransform(1-mask,cv2.DIST_L2,5)
def fit(gray,nxt,core):
 pts=cv2.goodFeaturesToTrack(gray,180,.014,4,mask=(core*255),blockSize=5)
 if pts is None or len(pts)<15:return None,{'features':0,'inliers':0,'rms':None,'fb':None}
 q,st,_=cv2.calcOpticalFlowPyrLK(gray,nxt,pts,None,winSize=(21,21),maxLevel=3)
 back,bst,_=cv2.calcOpticalFlowPyrLK(nxt,gray,q,None,winSize=(21,21),maxLevel=3)
 keep=(st[:,0]>0)&(bst[:,0]>0)&(np.linalg.norm(back[:,0]-pts[:,0],axis=1)<.8);a=pts[keep,0];b=q[keep,0]
 if len(a)<15:return None,{'features':len(a),'inliers':0,'rms':None,'fb':None}
 aff,ins=cv2.estimateAffinePartial2D(a,b,method=cv2.RANSAC,ransacReprojThreshold=1.,maxIters=1500,confidence=.995)
 if aff is None:return None,{'features':len(a),'inliers':0,'rms':None,'fb':None}
 residual=np.linalg.norm(a@aff[:,:2].T+aff[:,2]-b,axis=1);frac=float(ins.mean());err=float(np.median(residual[ins[:,0]>0]));fb=float(np.median(np.linalg.norm(back[keep,0]-a,axis=1)))
 stats={'features':len(a),'inliers':round(frac,4),'rms':round(err,4),'fb':round(fb,4)}
 if frac<.72 or err>.75:return None,stats
 return aff,stats
def region(em,f):
 ks=em['keyframes'];a=max((k for k in ks if k['frame']<=f),key=lambda k:k['frame'],default=ks[0]);b=min((k for k in ks if k['frame']>=f),key=lambda k:k['frame'],default=ks[-1]);pa=np.array(a['points'],np.float32);pb=np.array(b['points'],np.float32)
 if not(a['reviewed'] and b['reviewed']) or pa.shape!=pb.shape or len(pa)<3:return None
 q=(f-a['frame'])/max(1,b['frame']-a['frame']);return pa*(1-q)+pb*q

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'public/media/local/fin-motion-012.json');args=parser.parse_args();OUT.mkdir(parents=True,exist_ok=True);cv2.setNumThreads(1);cv2.setRNGSeed(41);started=time.perf_counter()
 src=ROOT/'public/media/local/loop30-v2.mp4';oldpath=ROOT/'public/media/local/fish-data.json';annpath=ROOT/'public/media/local/fish-annotations.json';regpath=ROOT/'public/media/local/fin-regions-012.json';old=json.loads(oldpath.read_text());ann=json.loads(annpath.read_text());reg=json.loads(regpath.read_text());assert sha(src)==old['sourceSha256']==reg['sourceSha256']
 cap=cv2.VideoCapture(str(src));grays=[];rgbsmall=[]
 for f in range(900):
  ok,im=cap.read();assert ok;small=cv2.resize(im,(640,360),interpolation=cv2.INTER_AREA);grays.append(cv2.cvtColor(small,cv2.COLOR_BGR2GRAY));rgbsmall.append(small)
 cap.release();masks=[unrle(f['rle']) for f in old['frames']];frames=[];raw=[];body=[];valid_sites=0
 backward_prev=cv2.calcOpticalFlowFarneback(grays[0],grays[899],None,.5,3,19,3,5,1.2,0)
 for f in range(900):
  prev=(f-1)%900;nxt=(f+1)%900;gray=grays[f];forward=cv2.calcOpticalFlowFarneback(gray,grays[nxt],None,.5,3,19,3,5,1.2,0);backward=cv2.calcOpticalFlowFarneback(grays[nxt],gray,None,.5,3,19,3,5,1.2,0);sdf=signed(masks[f]);sdfnext=signed(masks[nxt]);sdfprev=signed(masks[prev]);oldfin=unrle(old['frames'][f]['finRle']);regions=[];sites=[];fits=[]
  for em in reg['emitters']:
   if not em['start']<=f<=em['end']:continue
   polygon=region(em,f)
   if polygon is None:continue
   emmask=poly(polygon,640,360)*oldfin*masks[f];track=next(t for t in ann['tracks'] if t['id']==em['fishTrack']);key=interpolate(track,f);core=cv2.erode(poly(key['body'],640,360),np.ones((11,11),np.uint8))*masks[f]
   aff,stats=fit(gray,grays[nxt],core);rev,bstats=fit(gray,grays[prev],core);fits.append({'emitter':em['id'],'forward':stats,'backward':bstats})
   nose=(key['body'][0]+key['body'][-1])/2;tail=key['body'][4];angle=float(math.atan2(*(tail-nose)[::-1]));center=np.mean(key['body'],axis=0);noise=max(2.,float(stats['rms'] or .75)*30)
   goodbody=aff is not None and rev is not None and old['frames'][f]['valid'] and f not in reg['disabledFrames']
   current=[]
   for p in old['frames'][f]['p']:
    x,y=p[:2]
    if not emmask[y,x] or not p[12] or max(p[2:5])<38:continue
    if not goodbody:continue
    pos=np.array([x,y],float);normal=np.array(p[5:7]);lf=np.median(forward[max(0,y-1):y+2,max(0,x-1):x+2].reshape(-1,2),axis=0);lb=np.median(backward_prev[max(0,y-1):y+2,max(0,x-1):x+2].reshape(-1,2),axis=0)
    bf=aff[:,:2]@pos+aff[:,2]-pos;br=rev[:,:2]@pos+rev[:,2]-pos;rel=.5*((lf-bf)-(lb-br))*30
    fb=float(np.linalg.norm(lf+at(backward,pos+lf)));edgeerr=abs(float(at(sdfnext,pos+lf))-float(sdf[y,x]));scale=float(np.linalg.norm(aff[:,0]));rscale=float(np.linalg.norm(rev[:,0]));edged=.5*((float(at(sdfnext,pos+bf))-float(sdf[y,x])*scale)-(float(at(sdfprev,pos+br))-float(sdf[y,x])*rscale))*30
    if fb>1.15 or edgeerr>2.8 or np.linalg.norm(rel)>160 or abs(edged)>160:continue
    mixed=rel*.4+normal*edged*.6;edgeid=int(((math.atan2(y-tail[1],x-tail[0])-angle+math.pi*4)%(math.pi*2))/(math.pi*2)*24)
    vbody=.5*(bf-br)*30
    current.append([x,y,*p[2:7],*np.round(vbody,5).tolist(),*np.round(mixed,5).tolist(),round(fb,4),round(edgeerr,4),round(edged,4),0,em['id'],edgeid,round(noise,4)])
   sites+=current
   # Held-out silhouette sites: source contour points not in emitter candidates, using geometry only.
   contours,_=cv2.findContours(masks[f],cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);held=[];used={(p[0],p[1]) for p in current}
   if goodbody:
    for co in contours:
     for x,y in co[:,0][::7]:
      if not emmask[y,x] or (int(x),int(y)) in used:continue
      pos=np.array([x,y],float);bf=aff[:,:2]@pos+aff[:,2]-pos;br=rev[:,:2]@pos+rev[:,2]-pos
      d=.5*((float(at(sdfnext,pos+bf))-float(sdf[y,x])*np.linalg.norm(aff[:,0]))-(float(at(sdfprev,pos+br))-float(sdf[y,x])*np.linalg.norm(rev[:,0])))*30
      if abs(d)<160:held.append(abs(d))
   regions.append({'id':em['id'],'name':em['name'],'rle':rle(emmask),'reviewed':True,'valid':bool(goodbody and len(current)>=2),'angle':round(angle,6),'noise':round(noise,4),'speed':0,'referenceSpeed':round(float(np.median(held)) if held else 0,4),'referenceSites':len(held),'support':0})
  frames.append({'i':f,'valid':old['frames'][f]['valid'],'regions':regions,'p':sites});body.append({'frame':f,'fits':fits});backward_prev=backward
  if f%100==0:print(json.dumps({'frame':f,'sites':len(sites),'seconds':round(time.perf_counter()-started,1)}),flush=True)
 # Centered, emitter/edge-bin temporal support. No smoothing across different fish identities.
 original=[[p.copy() for p in fr['p']] for fr in frames]
 for f,fr in enumerate(frames):
  kept=[]
  for p in fr['p']:
   observations=[]
   for delta in [-2,-1,0,1,2]:
    near=original[(f+delta)%900];same=[q for q in near if q[15]==p[15] and min((q[16]-p[16])%24,(p[16]-q[16])%24)<=1]
    if same:observations.append(min(same,key=lambda q:(q[0]-p[0])**2+(q[1]-p[1])**2))
   p[14]=len(observations)
   if len(observations)<3:continue
   vel=np.median(np.array([q[9:11] for q in observations]),axis=0);p[9:11]=np.round(vel,5).tolist();kept.append(p)
  fr['p']=kept;valid_sites+=len(kept)
  for em in fr['regions']:
   ps=[p for p in kept if p[15]==em['id']];em['valid']=bool(em['valid'] and len(ps)>=2);em['support']=len(ps)
   speeds=[max(0,float(np.linalg.norm(p[9:11]))-p[17]) for p in ps];em['speed']=round(float(np.mean(speeds)) if speeds else 0,4)
 # Stable block shuffle within each named fin; geometry/color/validity always stay at the source frame.
 donor={}
 for em in reg['emitters']:
  ids=[f for f in range(em['start'],em['end']+1)];blocks=[ids[i:i+15] for i in range(0,len(ids),15)];rng=np.random.default_rng(41+em['id']);order=rng.permutation(len(blocks));shuffled=[f for j in order for f in blocks[int(j)]]
  donor[str(em['id'])]=dict(zip(map(str,ids),shuffled))
 data={'schema':1,'sourceSha256':old['sourceSha256'],'fishDataSha256':sha(oldpath),'regionSha256':sha(regpath),'fps':30,'duration':30,'frameCount':900,'width':640,'height':360,'fields':['x','y','r','g','b','nx','ny','bodyVxPx','bodyVyPx','relativeVxPx','relativeVyPx','forwardBackwardErrorPx','edgeMatchErrorPx','normalEdgeSpeedPx','temporalSupportFrames','emitterId','edgeArcBin','noiseFloorPxPerSec'],'confidenceMeaning':'Observed support count in a centered 5-frame window, NOT detection probability. Raw FB/edge/body-fit measurements are retained.','emitters':[{'id':e['id'],'name':e['name'],'start':e['start'],'end':e['end']} for e in reg['emitters']],'shuffle':donor,'frames':frames}
 args.output.write_text(json.dumps(data,separators=(',',':')),encoding='utf-8');invalid=[f for f in frames if not any(e['valid'] for e in f['regions'])]
 report={'sourceSha256':old['sourceSha256'],'fishDataSha256':data['fishDataSha256'],'regionSha256':data['regionSha256'],'frames':900,'validSites':valid_sites,'invalidFinFrames':[f['i'] for f in invalid],'bodyFits':body,'seconds':round(time.perf_counter()-started,2),'bytes':args.output.stat().st_size,'limitations':['Manual distal caudal sectors only; no named-ray identity or translucent extent certification.','Held-out reference uses the same silhouette/body fit, not independent anatomical ground truth.','Centered 5-frame filter is offline and can smooth fast reversals.','Invalid fits or insufficient support suppress C rather than add body/water emitters.']}
 (OUT/'motion-report.json').write_text(json.dumps(report,indent=2))
 # Review contact sheets, with actual candidate vectors and speed/support labels.
 picks=list(range(0,900,15))+[899]
 for page in range((len(picks)+11)//12):
  sheet=np.zeros((4*390,3*640,3),np.uint8)
  for j,f in enumerate(picks[page*12:page*12+12]):
   im=rgbsmall[f].copy();fr=frames[f]
   for em in reg['emitters']:
    if em['start']<=f<=em['end']:
     p=region(em,f)
     if p is not None:cv2.polylines(im,[p.astype(np.int32)],True,(150,220,255),1)
   for p in fr['p']:
    x,y=p[:2];cv2.circle(im,(x,y),2,(80,255,190),-1);cv2.line(im,(x,y),(round(x+p[9]*.2),round(y+p[10]*.2)),(240,80,220),1)
   label=f'f{f} / '+', '.join(f"{e['id']}:{e['speed']:.1f}px/s n{e['support']}" for e in fr['regions']);cv2.putText(im,label,(8,348),cv2.FONT_HERSHEY_SIMPLEX,.4,(255,255,255),1);sheet[j//3*390:j//3*390+360,j%3*640:(j%3+1)*640]=im
  cv2.imwrite(str(OUT/f'fin-review-{page}.jpg'),sheet)
 print(json.dumps({k:v for k,v in report.items() if k!='bodyFits'},indent=2))
if __name__=='__main__':main()
