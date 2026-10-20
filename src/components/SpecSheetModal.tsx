import React,{useEffect,useRef,useState} from 'react';
import {Material} from '../types/material';
import {X,ExternalLink,ZoomIn} from 'lucide-react';
import {MaterialImage,imageUrl} from './MaterialImage';
export const SpecSheetModal:React.FC<{material:Material;isOpen:boolean;onClose:()=>void}>=({material:m,isOpen,onClose})=>{
 const dialog=useRef<HTMLDialogElement>(null);const [large,setLarge]=useState(false);
 useEffect(()=>{if(isOpen)dialog.current?.showModal();else dialog.current?.close();},[isOpen]);
 useEffect(()=>setLarge(false),[m.id]);
 return <dialog ref={dialog} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}} className="m-auto w-[min(960px,94vw)] max-h-[92vh] rounded-2xl p-0 border border-slate-200 shadow-2xl backdrop:bg-slate-950/70" aria-labelledby="material-detail-title">
 <header className="sticky top-0 bg-white z-10 flex justify-between gap-4 items-start border-b p-5"><div><p className="text-blue-700 text-xs font-mono mb-1">{m.id}</p><h2 id="material-detail-title" className="font-bold text-xl text-slate-900">{m.name_zh}</h2><p className="text-xs text-slate-500 mt-1">台灣百和 Material Hub · 公開材料資料</p></div><button aria-label="關閉材料說明" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X/></button></header>
 <div className="p-5 space-y-6"><button className={'block w-full bg-slate-50 border rounded-xl overflow-hidden '+(large?'':'max-h-[420px]')} onClick={()=>setLarge(v=>!v)} aria-label={large?'縮小材料圖片':'放大材料圖片'} aria-pressed={large}><MaterialImage key={m.id} src={m.image_url} alt={m.name_zh+' '+m.id} className={'w-full object-contain '+(large?'max-h-[75vh]':'h-80')}/><span className="flex justify-center items-center gap-1 text-xs text-blue-700 p-2"><ZoomIn size={14}/>{large?'點擊縮小':'點擊放大'}</span></button>
 <div className="flex flex-wrap gap-2">{[...new Set(m.tags||[])].map(t=><span key={t} className="bg-blue-50 text-blue-800 rounded-full px-3 py-1 text-xs">{t}</span>)}</div>
 <section><h3 className="font-semibold mb-2">Material Hub 對應說明</h3><p className="whitespace-pre-line text-sm leading-7 text-slate-700">{m.description||'來源未提供文字說明。'}</p></section>
 {!!m.specifications?.length&&<section><h3 className="font-semibold mb-2">官方規格表</h3>{m.specifications.map((table,i)=><table key={i} className="w-full text-sm border-collapse mb-3"><tbody>{table.map((row,j)=><tr key={j}>{row.length===1?<th colSpan={Math.max(...table.map(r=>r.length))} className="border border-slate-200 bg-slate-100 p-3 text-left">{row[0]}</th>:row.map((cell,k)=><td key={k} className="border border-slate-200 p-3">{cell||'—'}</td>)}</tr>)}</tbody></table>)}</section>}
 <dl className="grid grid-cols-2 gap-4 text-sm">{[['成分',m.composition],['機能',m.function],['結構',m.structure],['特性',m.feature],['應用',m.application],['原產地',m.origin]].map(([label,values])=><div key={String(label)}><dt className="text-slate-500 text-xs">{label}</dt><dd className="mt-1">{Array.isArray(values)&&values.length?values.join('、'):'來源未提供'}</dd></div>)}</dl>
 <p className="text-xs text-slate-500">說明核對：{m.source_checked_at||'未記錄'} · 圖片與原頁連結核對：{m.image_checked_at||'未記錄'}。顏色與規格以官方最新資料及實體樣品為準。</p></div>
 <footer className="sticky bottom-0 bg-white border-t p-4 flex gap-3"><a href={m.official_url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm inline-flex gap-2 items-center">Material Hub 原頁<ExternalLink size={15}/></a><a href={imageUrl(m.image_url)} target="_blank" rel="noreferrer" className="border rounded-lg px-4 py-2 text-sm">開啟原尺寸圖片</a></footer>
 </dialog>;
};
