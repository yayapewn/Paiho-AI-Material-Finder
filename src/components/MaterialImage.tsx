import React,{useState} from 'react';
export function imageUrl(src:string){return /^https?:\/\//.test(src)?src:import.meta.env.BASE_URL+src.replace(/^\//,'');}
export function MaterialImage({src,alt,className=''}:{src:string;alt:string;className?:string}){
 const [failed,setFailed]=useState(false);
 return failed?<div className={'flex items-center justify-center bg-slate-100 text-slate-500 text-sm '+className}>圖片無法載入，請查看 Material Hub 原頁</div>:<img src={imageUrl(src)} alt={alt} className={className} loading="lazy" onError={()=>setFailed(true)}/>;
}
