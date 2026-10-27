import React,{useState,useEffect} from 'react';
import {Header} from './components/Header';
import {CameraUpload} from './components/CameraUpload';
import {ImagePreview} from './components/ImagePreview';
import {MaterialLibraryBrowserModal} from './components/MaterialLibraryBrowserModal';
import {MaterialImportModal} from './components/MaterialImportModal';
import {materialRepository} from './services/materialRepository';
import {BrowserResults,searchLocally,LocalResponse} from './components/BrowserSearch';

import {PhotoCrop} from './components/PhotoCrop';
import {MatchMode,modeLabels} from './components/VisualFeatures';
const tags=['透氣','彈性','反光','輕量','耐磨','柔軟','網孔','針織','梭織','緹花','鞋面','鞋帶','織帶','黑色','白色','回收'];
export default function App(){
 const [photo,setPhoto]=useState<string|null>(null),[query,setQuery]=useState(''),[selected,setSelected]=useState<string[]>([]);
 const [original,setOriginal]=useState<string|null>(null),[category,setCategory]=useState('all'),[mode,setMode]=useState<MatchMode>('balanced');
 function choosePhoto(data:string){setPhoto(data);setOriginal(data);setError('')}
 const [busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState('');
 const [response,setResponse]=useState<LocalResponse|null>(null),[library,setLibrary]=useState(false),[importing,setImporting]=useState(false);
 const [count,setCount]=useState(materialRepository.getAllMaterials().length);
 useEffect(()=>materialRepository.subscribe(()=>{setCount(materialRepository.getAllMaterials().length);setResponse(null)}),[]);
 async function search(){if(busy)return;setBusy(true);setError('');setProgress('正在讀取照片特徵…');setResponse(null);
  try{setResponse(await searchLocally(materialRepository.getAllMaterials(),photo,query,selected,setProgress,{category,mode}))}
  catch(e){setError(e instanceof Error?e.message:'搜尋失敗，請重新選擇圖片再試。')}
  finally{setBusy(false)}
 }
 return <div className="min-h-screen bg-slate-100 text-slate-900"><Header onOpenLibrary={()=>setLibrary(true)} onOpenImport={()=>setImporting(true)} materialCount={count}/>
 <main className="max-w-2xl mx-auto p-4 space-y-4">
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><h2 className="font-bold">裝置內照片比對 · {count} 筆材料</h2><p className="text-sm mt-1">照片只在此瀏覽器處理，不會上傳。以顏色與紋理找外觀接近的材料；不是 AI 材質辨識，無法由照片確認成分、透氣性或認證。</p><p className="text-xs mt-2">請讓材料填滿畫面並使用均勻光線，減少背景干擾。首次搜尋需載入材料圖片。</p><button onClick={()=>setLibrary(true)} className="text-blue-700 underline mt-2">瀏覽全部樣品與說明</button></div>
 {error&&<div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">{error}</div>}
 {response?<BrowserResults response={response} onBack={()=>setResponse(null)}/>:<>
 {!photo?<CameraUpload onImageSelected={choosePhoto} onError={setError} isLoading={busy}/>:<ImagePreview imageUrl={photo} onRetake={choosePhoto} onDelete={()=>{setPhoto(null);setOriginal(null)}} disabled={busy}/>}
 <div className="bg-white border rounded-xl p-4 space-y-3"><label className="block">材料類別（建議先選）<select aria-label="限定材料類別" value={category} disabled={busy} onChange={e=>setCategory(e.target.value)} className="border rounded-lg p-2 ml-2"><option value="all">全部類別</option>{[...new Set(materialRepository.getAllMaterials().flatMap(m=>m.product))].map(c=><option key={c}>{c}</option>)}</select></label><label className="block">比對偏好<select aria-label="比對偏好" value={mode} disabled={busy} onChange={e=>setMode(e.target.value as MatchMode)} className="border rounded-lg p-2 ml-2">{Object.entries(modeLabels).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label><p className="text-xs text-slate-500">找相近織紋、顏色可不同：選紋理優先；要找同色系：選顏色優先。類別會直接限制搜尋範圍。</p></div>
 {photo&&<PhotoCrop key={photo} src={photo} onApply={setPhoto} disabled={busy}/>}{photo&&original&&photo!==original&&<button disabled={busy} onClick={()=>setPhoto(original)} className="text-blue-700 underline">還原未裁切照片</button>}
 <div className="bg-white border rounded-xl p-4"><label htmlFor="local-query" className="font-bold">材料編號或關鍵字（選填）</label><input id="local-query" value={query} disabled={busy} onChange={e=>setQuery(e.target.value)} placeholder="例如：TJ01-56、織帶、反光、回收" className="border rounded-lg p-3 mt-2 w-full"/><p className="text-xs text-slate-500 mt-2">文字搜尋採關鍵字比對，不解析複雜語句。照片搭配文字時，文字符合程度會影響排名。</p><div className="flex flex-wrap gap-2 mt-3">{tags.map(t=><button key={t} disabled={busy} aria-pressed={selected.includes(t)} onClick={()=>setSelected(old=>old.includes(t)?old.filter(v=>v!==t):[...old,t])} className={'border rounded-lg px-3 py-1 text-sm '+(selected.includes(t)?'bg-blue-600 text-white':'bg-white')}>{t}</button>)}</div></div>
 <button disabled={busy||(!photo&&!query.trim()&&!selected.length)} onClick={search} className="w-full rounded-xl bg-blue-600 disabled:opacity-40 text-white p-4 font-bold">{busy?'正在比對…':photo?'搜尋外觀相似材料':'搜尋材料關鍵字'}</button>{busy&&<p role="status" aria-live="polite">{progress}</p>}
 </>}
 </main><footer className="text-center text-xs text-slate-500 p-6">照片僅在瀏覽器記憶體處理，重新整理即清除。材料規格以百和 Material Hub 原頁為準。</footer>
 <MaterialLibraryBrowserModal isOpen={library} onClose={()=>setLibrary(false)}/><MaterialImportModal isOpen={importing} onClose={()=>setImporting(false)} onMaterialCountChange={()=>setCount(materialRepository.getAllMaterials().length)}/>
 </div>;
}
