export type Descriptor = {color:number[]; texture:number[]; pattern:number[]};
const normalized=(v:number[])=>{const sum=v.reduce((a,b)=>a+b,0)||1;return v.map(n=>n/sum)};
// Rotation-invariant uniform local binary patterns at two radii. No material
// properties are inferred from these pixel distributions.
export function pixelDescriptor(data:Uint8ClampedArray,w:number,h:number,mask?:Uint8Array):Descriptor {
 const color=Array(64).fill(0),texture=Array(16).fill(0),patterns=[Array(10).fill(0),Array(10).fill(0)];
 const gray=new Float32Array(w*h);
 for(let i=0;i<w*h;i++)gray[i]=.299*data[i*4]+.587*data[i*4+1]+.114*data[i*4+2];
 for(let y=3;y<h-3;y++)for(let x=3;x<w-3;x++){
  const p=y*w+x,i=p*4,r=data[i],g=data[i+1],b=data[i+2];
  if(mask&&!mask[p])continue;
  const weight=1;
  color[(r>>6)*16+(g>>6)*4+(b>>6)]+=weight;
  // Avoid treating the removed background boundary as material texture.
  if(mask&&[-3*w-3,-3*w, -3*w+3,-3,3,3*w-3,3*w,3*w+3].some(o=>!mask[p+o]))continue;
  const gradient=(Math.abs(gray[p+1]-gray[p-1])+Math.abs(gray[p+w]-gray[p-w]))/2;
  texture[Math.min(15,Math.floor(gradient/16))]+=weight;
  [1,3].forEach((radius,scale)=>{
   const offsets=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
   const bits:number[]=offsets.map(([dx,dy])=>gray[p+dy*radius*w+dx*radius]>=gray[p]+2?1:0);
   const transitions=bits.reduce((s,v,k)=>s+Number(v!==bits[(k+1)%8]),0);
   const bin=transitions<=2?bits.reduce((s,v)=>s+v,0):9;
   patterns[scale][bin]+=weight;
  });
 }
 return {color:normalized(color),texture:normalized(texture),pattern:patterns.flatMap(normalized)};
}
export type MatchMode='balanced'|'texture'|'color';
export const modeLabels:Record<MatchMode,string>={balanced:'綜合比對',texture:'紋理優先',color:'顏色優先'};
const overlap=(a:number[],b:number[])=>a.reduce((s,v,i)=>s+Math.min(v,b[i]),0);
export function compareDescriptors(a:Descriptor,b:Descriptor,mode:MatchMode,ignoreColor=false){
 const color=overlap(a.color,b.color);
 const texture=.3*overlap(a.texture,b.texture)+.7*overlap(a.pattern,b.pattern)/2;
 const weight=ignoreColor?0:mode==='texture'?.2:mode==='color'?.8:.5;
 return {color,texture,total:weight*color+(1-weight)*texture};
}
