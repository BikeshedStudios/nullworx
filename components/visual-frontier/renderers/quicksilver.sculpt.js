// Original Shader Park source. Compiled locally; never accepts user-supplied code.
const sculpt = `
let tension = input(0.5, 0.0, 1.0);
let chroma = input(0.5, 0.0, 1.0);
let turnX = input(0.0, -1.0, 1.0);
let turnY = input(0.0, -1.0, 1.0);
setMaxIterations(110);
setStepSize(0.72);
rotateX(0.3 + turnY*0.55);
rotateY(0.2 + turnX*0.7);
rotateZ(-0.23);
let p = getSpace();
let a = atan(p.y, p.x);
let r = length(vec2(p.x, p.y));
let phase = a * 3.0 + time * 0.18;
let orbit = 0.15 + tension * 0.14;
let d1 = length(vec2(r - 0.77 - orbit*cos(phase), p.z - orbit*sin(phase))) - 0.13;
let d2 = length(vec2(r - 0.77 - orbit*cos(phase+2.094), p.z - orbit*sin(phase+2.094))) - 0.13;
let d3 = length(vec2(r - 0.77 - orbit*cos(phase+4.188), p.z - orbit*sin(phase+4.188))) - 0.13;
let d = min(min(d1,d2),d3);
let etch = sin(a*54.0 + p.z*22.0) * sin(r*45.0) * 0.00008;
let bands = 0.5 + 0.5*sin(p.z*26.0 + a*4.0);
color(mix(vec3(0.76,0.82,0.88),vec3(0.15+bands*0.7,0.4+bands*0.35,0.65-bands*0.35),chroma));
metal(0.93);
shine(0.84);
lightDirection(0.6,0.8,1.0);
setSDF(d + etch);
`;

export default sculpt;
