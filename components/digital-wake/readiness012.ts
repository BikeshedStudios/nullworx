export type MediaFacts={state:'loading'|'ready'|'unsupported'|'invalid';duration:number|null;width:number;height:number;frame:number|null;reason:string|null};
export function mediaFacts(v:HTMLVideoElement):MediaFacts{
 const duration=Number.isFinite(v.duration)&&v.duration>0?v.duration:null,width=Number.isFinite(v.videoWidth)?v.videoWidth:0,height=Number.isFinite(v.videoHeight)?v.videoHeight:0;
 const frame=Number.isFinite(v.currentTime)&&v.currentTime>=0?Math.floor(v.currentTime*30+1e-4):null;
 if(v.error)return {state:v.error.code===4?'unsupported':'invalid',duration,width,height,frame,reason:`media error ${v.error.code}: ${v.error.message||'decode/network failure'}`};
 if(v.readyState<2)return {state:'loading',duration,width,height,frame,reason:null};
 if(duration===null||width<=0||height<=0)return {state:'invalid',duration,width,height,frame,reason:'Decoded media has nonfinite/zero duration or dimensions'};
 return {state:'ready',duration,width,height,frame,reason:null};
}
export function readyForCapture(v:HTMLVideoElement,check:()=>{data:boolean;renderer:boolean;error:string|null}):Promise<MediaFacts>{
 return new Promise((resolve,reject)=>{
  const finish=(error?:string,facts?:MediaFacts)=>{clearInterval(poll);clearTimeout(timer);for(const e of events)v.removeEventListener(e,inspect);if(error)reject(new Error(error));else resolve(facts!);};
  const inspect=()=>{const s=check(),m=mediaFacts(v);if(s.error)return finish(s.error);if(m.state==='invalid'||m.state==='unsupported')return finish(m.reason!);if(s.data&&s.renderer&&m.state==='ready')return finish(undefined,m);};
  const events=['loadeddata','durationchange','error','canplay'];const poll=setInterval(inspect,25);const timer=setTimeout(()=>{const s=check(),m=mediaFacts(v);finish(`Readiness incomplete: data=${s.data}, renderer=${s.renderer}, media=${m.state}. ${s.error??m.reason??''}`);},10000);
  for(const e of events)v.addEventListener(e,inspect);inspect();
 });
}
export function seekPresentedFrame(v:HTMLVideoElement,frame:number,last:()=>number):Promise<number>{
 if(!Number.isInteger(frame)||frame<0||frame>=900)return Promise.reject(new Error('Source frame must be 0–899'));
 const m=mediaFacts(v);if(m.state!=='ready')return Promise.reject(new Error(m.reason??`Media ${m.state}`));
 if(last()===frame&&!v.seeking&&v.readyState>=2)return Promise.resolve(frame/30);
 return new Promise((resolve,reject)=>{
  let cb=0,actualTime:number|null=null;
  const events=['seeked','loadeddata','canplay'];
  const finish=(error?:string,time?:number)=>{clearTimeout(timer);for(const e of events)v.removeEventListener(e,complete);v.removeEventListener('error',onError);if(cb)v.cancelVideoFrameCallback(cb);if(error)reject(new Error(error));else resolve(time!);};
  const complete=()=>{if(!v.requestVideoFrameCallback)actualTime=frame/30;if(actualTime!==null&&!v.seeking&&v.readyState>=2)finish(undefined,actualTime);};
  const onError=()=>finish(v.error?.message??'Media failed while seeking');
  const onFrame=(_n:number,meta:VideoFrameCallbackMetadata)=>{cb=0;const actual=Math.floor(meta.mediaTime*30+1e-4);if(actual===frame){actualTime=meta.mediaTime;complete();}else cb=v.requestVideoFrameCallback(onFrame);};
  const timer=setTimeout(()=>finish(`No decoded/presented frame ${frame}; presented=${actualTime}, seeking=${v.seeking}, readyState=${v.readyState}`),3000);
  for(const e of events)v.addEventListener(e,complete);v.addEventListener('error',onError,{once:true});if(v.requestVideoFrameCallback)cb=v.requestVideoFrameCallback(onFrame);
  v.currentTime=(frame+.05)/30;
 });
}
/** Unbind before deletion so a current WebGL program is actually released immediately. */
export function disposeRenderer(renderer:{gl:WebGL2RenderingContext;destroy:()=>void}){
 const gl=renderer.gl;gl.useProgram(null);gl.bindVertexArray(null);for(const unit of [gl.TEXTURE0,gl.TEXTURE1]){gl.activeTexture(unit);gl.bindTexture(gl.TEXTURE_2D,null);}renderer.destroy();
}
