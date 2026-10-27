import React,{useState} from 'react';
export function PhotoCrop({src,onApply,disabled}:{src:string;onApply:(s:string)=>void;disabled:boolean}){
 const [box,setBox]=useState({left:0,top:0,right:100,bottom:100});
 const [pending,setPending]=useState(false),[error,setError]=useState('');
 async function apply(){setPending(true);setError('');try{
  const img=new Image();img.src=src;await img.decode();
  const x=img.naturalWidth*box.left/100,y=img.naturalHeight*box.top/100;
  const w=img.naturalWidth*(box.right-box.left)/100,h=img.naturalHeight*(box.bottom-box.top)/100;
  if(Math.min(w,h)<32)throw new Error('裁切範圍太小，請保留更多材料紋路，或重新拍攝近照。');
  const c=document.createElement('canvas');c.width=Math.round(w);c.height=Math.round(h);
  const ctx=c.getContext('2d');if(!ctx)throw new Error('無法裁切圖片');ctx.drawImage(img,x,y,w,h,0,0,c.width,c.height);
  onApply(c.toDataURL('image/png'));
 }catch(e){setError(e instanceof Error?e.message:'無法裁切圖片')}finally{setPending(false)}}
 return <details className="bg-white border rounded-xl p-4"><summary className="font-bold cursor-pointer">裁切材料範圍（去除背景）</summary><p className="text-sm my-2">調整四邊，保留藍框內的材料。請保留一段完整紋路，避免只剩純色。</p><div className="relative overflow-hidden"><img src={src} alt="裁切範圍預覽" className="block w-full"/><div className="absolute border-2 border-blue-600 pointer-events-none" style={{left:box.left+'%',top:box.top+'%',width:(box.right-box.left)+'%',height:(box.bottom-box.top)+'%',boxShadow:'0 0 0 9999px #0007'}}/></div>
 {(['left','right','top','bottom'] as const).map((side,i)=><label key={side} className="flex items-center gap-2 mt-2 text-sm">{['左邊','右邊','上邊','下邊'][i]} {box[side]}%<input aria-label={['裁切左邊','裁切右邊','裁切上邊','裁切下邊'][i]} className="flex-1" type="range" min={side==='right'?box.left+5:side==='bottom'?box.top+5:0} max={side==='left'?box.right-5:side==='top'?box.bottom-5:100} value={box[side]} disabled={disabled||pending} onChange={e=>setBox({...box,[side]:Number(e.target.value)})}/></label>)}
 <button disabled={disabled||pending} onClick={apply} className="bg-blue-600 text-white rounded-lg px-4 py-2 mt-3">{pending?'裁切中…':'套用裁切'}</button><p role="alert" className="text-red-700 text-sm">{error}</p></details>;
}
