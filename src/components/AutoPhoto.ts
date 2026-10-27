// Conservative border-connected background separation. Ambiguous scenes retain
// every pixel; this is not a learned foreground segmentation model.
export function separateBackground(data:Uint8ClampedArray,w:number,h:number){
 const n=w*h,mask=new Uint8Array(n).fill(1),border:number[]=[];
 for(let x=0;x<w;x++){border.push(x,(h-1)*w+x)}
 for(let y=1;y<h-1;y++){border.push(y*w,y*w+w-1)}
 const med=(a:number[])=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];
 const bg=[0,1,2].map(c=>med(border.map(p=>data[p*4+c])));
 const distance=(p:number)=>Math.hypot(...bg.map((v,c)=>v-data[p*4+c]));
 const uniform=border.filter(p=>distance(p)<32).length/border.length;
 const unchanged={mask,removed:0,status:'背景較複雜或與材料接近，保留原圖比對'};
 if(uniform<.8)return unchanged;
 const seen=new Uint8Array(n),queue:number[]=[];
 const visit=(p:number)=>{if(!seen[p]&&distance(p)<38){seen[p]=1;queue.push(p)}};
 border.forEach(visit);
 for(let k=0;k<queue.length;k++){const p=queue[k],x=p%w,y=Math.floor(p/w);if(x)visit(p-1);if(x<w-1)visit(p+1);if(y)visit(p-w);if(y<h-1)visit(p+w)}
 const ratio=queue.length/n;
 if(ratio<.08||ratio>.94)return unchanged;
 queue.forEach(p=>mask[p]=0);
 return {mask,removed:ratio,status:'已自動排除與邊緣相連的單純背景'};
}
export function colorSummary(data:Uint8ClampedArray,mask:Uint8Array){
 const counts=new Map<string,number>();
 for(let p=0;p<mask.length;p++){if(!mask[p])continue;const r=data[p*4]/255,g=data[p*4+1]/255,b=data[p*4+2]/255;
  const hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo;
  let hue=d===0?0:hi===r?60*(((g-b)/d+6)%6):hi===g?60*((b-r)/d+2):60*((r-g)/d+4);
  const label=hi<.22?'黑色':d<.12?(hi>.85?'白色':'灰色'):hue<15||hue>=345?'紅色':hue<45?(hi<.65?'棕色':'橘色'):hue<70?'黃色':hue<165?'綠色':hue<200?'青色':hue<265?'藍色':hue<310?'紫色':'粉紅色';
  counts.set(label,(counts.get(label)||0)+1);
 }
 const total=[...counts.values()].reduce((a,b)=>a+b,0)||1;
 return [...counts].sort((a,b)=>b[1]-a[1]).filter(([,n])=>n/total>.08).slice(0,3).map(([name,n])=>({name,percent:Math.round(100*n/total)}));
}
