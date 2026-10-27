import React, {useState} from 'react';
import {Material} from '../types/material';
import {MaterialImage, imageUrl} from './MaterialImage';
import {SpecSheetModal} from './SpecSheetModal';

import {Descriptor, pixelDescriptor, compareDescriptors, MatchMode, modeLabels} from './VisualFeatures';
export type LocalResult = {material:Material; score:number; matched:string[]; colorScore?:number; textureScore?:number};
export type LocalResponse = {results:LocalResult[]; compared:number; skipped:number; hasImage:boolean; category:string; mode:MatchMode};
const cache = new Map<string, Promise<Descriptor>>();
const normalize = (v:number[]) => {const sum=v.reduce((a,b)=>a+b,0)||1;return v.map(n=>n/sum)};

// Colour distribution and rotation-insensitive local contrast. These are pixel
// measurements, not learned embeddings or inferred material properties.
export async function describeImage(src:string):Promise<Descriptor> {
 const img = new Image(); img.crossOrigin='anonymous';
 await new Promise<void>((resolve,reject)=>{
  const timer=setTimeout(()=>{img.src='';reject(new Error('圖片讀取逾時'))},15000);
  img.onload=()=>{clearTimeout(timer);resolve()};
  img.onerror=()=>{clearTimeout(timer);reject(new Error('圖片無法讀取'))}; img.src=src;
 });
 // Preserve aspect ratio; finer image sampling retains more weave detail.
 const scale=192/Math.max(img.naturalWidth,img.naturalHeight);
 const w=Math.max(8,Math.round(img.naturalWidth*scale)),h=Math.max(8,Math.round(img.naturalHeight*scale));
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('此瀏覽器無法處理圖片');
 ctx.fillStyle='white';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
 return pixelDescriptor(ctx.getImageData(0,0,w,h).data,w,h);
}
const overlap=(a:number[],b:number[])=>a.reduce((s,v,i)=>s+Math.min(v,b[i]),0);
const synonyms=['透氣|breathable','彈性|stretch|elastic|鬆緊','輕量|lightweight','反光|reflective','耐磨|abrasion','柔軟|soft','網孔|mesh','針織|knit','梭織|woven','緹花|jacquard','鞋面|upper','鞋帶|shoelace','織帶|webbing','黑色|black','白色|white','藍色|blue','紅色|red','綠色|green','回收|環保|recycled'];
function termsFor(query:string,tags:string[]):string[][]{
 const text=[query,...tags].join(' ').toLowerCase();
 const groups=synonyms.map(s=>s.split('|')).filter(g=>g.some(s=>text.includes(s)));
 const remaining=text.split(/[\s,，、。；;]+/).filter(s=>s.length>1&&!groups.some(g=>g.some(t=>s.includes(t))));
 return [...groups,...remaining.map(s=>[s])];
}
export async function searchLocally(materials:Material[],photo:string|null,query:string,tags:string[],progress:(s:string)=>void,options:{category:string;mode:MatchMode}={category:'all',mode:'balanced'}):Promise<LocalResponse>{
 materials=materials.filter(m=>options.category==='all'||m.product.includes(options.category));
 const groups=termsFor(query,tags);const sample=photo?await describeImage(photo):null;
 const ignoreColor=/不限制顏色|不限顏色|顏色不拘|ignore color/i.test(query);
 let next=0,done=0,skipped=0;const results:LocalResult[]=[];
 async function worker(){while(next<materials.length){const m=materials[next++];
  const text=[m.id,m.name_zh,m.name_en,m.description,...m.product,...m.structure,...m.function,...m.color,...m.application,...(m.tags||[])].join(' ').toLowerCase();
  const matched=groups.filter(g=>g.some(s=>text.includes(s))).map(g=>g[0]);
  let visual=0,colorScore:number|undefined,textureScore:number|undefined;
  if(sample){try{const url=imageUrl(m.image_url);let promise=cache.get(url);if(!promise){promise=describeImage(url);cache.set(url,promise);promise.catch(()=>cache.delete(url));}const d=await promise;
   const scores=compareDescriptors(sample,d,options.mode,ignoreColor);visual=scores.total;colorScore=Math.round(scores.color*100);textureScore=Math.round(scores.texture*100);
  }catch{skipped++;done++;progress(`正在比對材料 ${done} / ${materials.length}`);continue;}}
  const keyword=groups.length?matched.length/groups.length:0;
  const score=100*(sample?(groups.length?.75*visual+.25*keyword:visual):keyword);
  if(sample||matched.length)results.push({material:m,score:Math.round(score),matched,colorScore,textureScore});
  done++;progress(`正在比對材料 ${done} / ${materials.length}`);
 }}
 await Promise.all(Array.from({length:4},worker));
 if(sample&&materials.length>0&&skipped===materials.length)throw new Error('材料圖片無法讀取，請確認網路連線後再試。');
 results.sort((a,b)=>b.score-a.score||a.material.id.localeCompare(b.material.id));
 return {results:results.slice(0,10),compared:materials.length-skipped,skipped,hasImage:!!sample,category:options.category,mode:options.mode};
}
export function BrowserResults({response,onBack}:{response:LocalResponse;onBack:()=>void}){
 const [inspect,setInspect]=useState<Material|null>(null);
 return <section className="space-y-4"><button className="border rounded-lg px-4 py-2 bg-white" onClick={onBack}>修改條件／重新拍照</button>
 <div className="bg-blue-50 p-4 rounded-xl"><h2 className="font-bold">{response.hasImage?'照片外觀比對結果':'文字搜尋結果'}</h2><p className="text-sm">已比對 {response.compared} 筆材料，顯示前 {response.results.length} 筆。{response.skipped>0&&`另有 ${response.skipped} 張圖片讀取失敗，未參與比對。`}</p><p className="text-sm mt-2">類別：{response.category==='all'?'全部':response.category} · {modeLabels[response.mode]}</p><p className="text-xs mt-2">{response.hasImage?'依顏色、明暗變化及兩種尺度的局部紋路排序；文字條件輔助排序。':'依材料編號、名稱、說明及標籤的關鍵字排序。'}比對分數是排序參考，並非辨識機率；不判斷成分或功能。光線、背景及拍攝距離會影響結果。</p></div>
 {!response.results.length&&<p role="status">沒有符合的材料，請改用材料編號或簡短關鍵字。</p>}
 {response.results.map((r,i)=><article key={r.material.id} className="bg-white rounded-xl border p-4"><div className="flex justify-between gap-3"><h3 className="font-bold">#{i+1} {r.material.id} · {r.material.name_zh}</h3><span className="text-sm shrink-0">比對分數 {r.score}/100</span></div><button className="w-full h-56 bg-slate-50 my-3" aria-label={'預覽 '+r.material.id} onClick={()=>setInspect(r.material)}><MaterialImage src={r.material.image_url} alt={r.material.name_zh} className="h-full w-full object-contain"/></button><p className="text-xs text-slate-500 mb-2">{r.colorScore!==undefined&&`顏色分數 ${r.colorScore} · 紋理分數 ${r.textureScore}（非辨識機率）`}</p><p className="text-sm whitespace-pre-line line-clamp-3">{r.material.description}</p>{r.matched.length>0&&<p className="text-sm mt-2 text-blue-700">文字符合：{r.matched.join('、')}</p>}<div className="flex gap-4 mt-3 text-sm"><button className="text-blue-700 underline" onClick={()=>setInspect(r.material)}>圖片與官方說明</button><a className="underline" href={r.material.official_url} target="_blank" rel="noreferrer">Material Hub 原頁</a></div></article>)}
 {inspect&&<SpecSheetModal material={inspect} isOpen onClose={()=>setInspect(null)}/>}</section>;
}
