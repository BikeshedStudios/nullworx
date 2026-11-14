import { WebGPURenderer } from 'three/webgpu';

// These studies deliberately use Three's WebGL2 node backend. Own its context
// so a paused canvas retains its pixels in WebKit. No cross-context upload.
// WebGLBackend does not forward preserveDrawingBuffer from renderer opts.
export async function createNodeRenderer() {
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
  if(!context)throw new Error('This node-material study requires WebGL2.');
  const renderer=new WebGPURenderer({canvas,context,antialias:true,alpha:true,forceWebGL:true});
  renderer.debug.checkShaderErrors=true;
  renderer.debug.onShaderError=(gl,program,_vertex,fragment)=>{throw new Error(`Shader compilation failed: ${gl.getProgramInfoLog(program) || gl.getShaderInfoLog(fragment) || 'unknown GPU error'}`);};
  const lose=()=>context.getExtension('WEBGL_lose_context')?.loseContext();
  try { await renderer.init(); } catch(error) { lose();throw error; }
  return {renderer,async disposeRenderer(){try { await renderer.dispose(); } finally { lose(); }}};
}
