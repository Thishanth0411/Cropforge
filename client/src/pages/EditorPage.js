import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PRESETS = [
<<<<<<< HEAD
  { label:'4 × 6"',  w:4,  h:6  }, { label:'5 × 7"',  w:5,  h:7  },
  { label:'8 × 10"', w:8,  h:10 }, { label:'11 × 14"', w:11, h:14 },
  { label:'12 × 18"',w:12, h:18 }, { label:'16 × 24"', w:16, h:24 },
  { label:'20 × 30"',w:20, h:30 }, { label:'24 × 36"', w:24, h:36 },
  { label:'1 × 1"',  w:1,  h:1  }, { label:'4 × 4"',  w:4,  h:4  },
];

const ADJ_DEFAULTS = {
  brightness:0,contrast:0,saturation:0,exposure:0,
  highlights:0,shadows:0,sharpness:0,temperature:0,tint:0,vignette:0
};
const SLIDERS = [
  {key:'brightness',label:'Brightness',min:-100,max:100},
  {key:'contrast',  label:'Contrast',  min:-100,max:100},
  {key:'saturation',label:'Saturation',min:-100,max:100},
  {key:'exposure',  label:'Exposure',  min:-100,max:100},
  {key:'highlights',label:'Highlights',min:-100,max:100},
  {key:'shadows',   label:'Shadows',   min:-100,max:100},
  {key:'sharpness', label:'Sharpness', min:0,   max:100},
  {key:'temperature',label:'Temp (°K)',min:-100,max:100},
  {key:'tint',      label:'Tint',      min:-100,max:100},
  {key:'vignette',  label:'Vignette',  min:0,   max:100},
];
const FILTERS = [
  {name:'None', vals:{}},
  {name:'Vivid',vals:{brightness:10,contrast:20,saturation:30}},
  {name:'Matte',vals:{contrast:-20,shadows:20,saturation:-10}},
  {name:'B&W',  vals:{saturation:-100,contrast:10}},
  {name:'Warm', vals:{temperature:40,saturation:10}},
  {name:'Cool', vals:{temperature:-40,saturation:5}},
  {name:'Fade', vals:{brightness:15,contrast:-30,saturation:-20}},
  {name:'Punch',vals:{contrast:30,saturation:20,sharpness:30}},
  {name:'Drama',vals:{contrast:40,shadows:-30,highlights:-20,saturation:-15}},
];
const MIN_FRAME = 40;
const HANDLES = [
  {id:'tl',style:{top:-6,left:-6,cursor:'nw-resize'}},
  {id:'tr',style:{top:-6,right:-6,cursor:'ne-resize'}},
  {id:'bl',style:{bottom:-6,left:-6,cursor:'sw-resize'}},
  {id:'br',style:{bottom:-6,right:-6,cursor:'se-resize'}},
  {id:'tc',style:{top:-6,left:'50%',transform:'translateX(-50%)',cursor:'n-resize'}},
  {id:'bc',style:{bottom:-6,left:'50%',transform:'translateX(-50%)',cursor:'s-resize'}},
  {id:'lc',style:{left:-6,top:'50%',transform:'translateY(-50%)',cursor:'w-resize'}},
  {id:'rc',style:{right:-6,top:'50%',transform:'translateY(-50%)',cursor:'e-resize'}},
=======
  { label:'4 × 6"',  w:4,  h:6  },
  { label:'5 × 7"',  w:5,  h:7  },
  { label:'8 × 10"', w:8,  h:10 },
  { label:'11 × 14"',w:11, h:14 },
  { label:'12 × 18"',w:12, h:18 },
  { label:'16 × 24"',w:16, h:24 },
  { label:'20 × 30"',w:20, h:30 },
  { label:'24 × 36"',w:24, h:36 },
  { label:'1 × 1"',  w:1,  h:1  },
  { label:'4 × 4"',  w:4,  h:4  },
>>>>>>> 5421cf09b210f0223df7bfcf6f1af66e9ebf9ff5
];

export default function EditorPage() {
  const { user, logout } = useAuth();

<<<<<<< HEAD
  const [files,      setFiles]      = useState([]);
  const [activeIdx,  setActiveIdx]  = useState(-1);
  const [uploading,  setUploading]  = useState(false);
  const [preset,     setPreset]     = useState(null);
  const [quality,    setQuality]    = useState(0.95);
  const [format,     setFormat]     = useState('jpeg');
  const [dpi,        setDpi]        = useState(300);
  const [customW,    setCustomW]    = useState('');
  const [customH,    setCustomH]    = useState('');
  const [frame,      setFrame]      = useState({x:0,y:0,w:0,h:0});
  const [imgOffset,  setImgOffset]  = useState({x:0,y:0});
  const [zoom,       setZoom]       = useState(1);
  const [cropRect,   setCropRect]   = useState(null);
  const [adj,        setAdj]        = useState({...ADJ_DEFAULTS});
  const [activeFilter,setActiveFilter] = useState(0);
  const [bulkResults,setBulkResults] = useState([]);
  const [activeTab,  setActiveTab]  = useState('editor');
  const [dragging,   setDragging]   = useState(false);

  // Mutable refs for drag (no re-render during drag)
  const frameRef    = useRef({x:0,y:0,w:0,h:0});
  const imgOffRef   = useRef({x:0,y:0});
  const zoomRef     = useRef(1);
  const naturalSize = useRef({w:0,h:0});
  const cropRectRef = useRef(null);
  const dragState   = useRef(null);
  const lastPinch   = useRef(0);

  const imgRef       = useRef(null);
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);

  // Keep refs in sync
  useEffect(()=>{ frameRef.current  = frame;     },[frame]);
  useEffect(()=>{ imgOffRef.current = imgOffset;  },[imgOffset]);
  useEffect(()=>{ zoomRef.current   = zoom;       },[zoom]);

  // ── CSS FILTER ──
  const cssFilter = (() => {
    const br = 1+adj.brightness/100, ct = 1+adj.contrast/100;
    const sat = 1+adj.saturation/100, exp = 1+adj.exposure/100;
    const hue = adj.temperature*0.15, sep = Math.max(0,adj.temperature/300);
    return [`brightness(${br*exp})`,`contrast(${ct})`,`saturate(${sat})`,`hue-rotate(${hue}deg)`,sep>0?`sepia(${sep})`:''].filter(Boolean).join(' ');
  })();

  // ── OVERLAY ──
  const drawOverlay = useCallback((fx,fy,fw,fh)=>{
    const oc = canvasRef.current; if(!oc) return;
    const ctx = oc.getContext('2d');
    ctx.clearRect(0,0,oc.width,oc.height);
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,0,oc.width,oc.height);
    ctx.clearRect(fx,fy,fw,fh);
  },[]);

  // ── CROP RECT ──
  const computeCropRect = useCallback((f,fx,fy,fw,fh,off,z)=>{
    const nw=naturalSize.current.w*z, nh=naturalSize.current.h*z;
    const scaleX=f.nw/nw, scaleY=f.nh/nh;
    const cx=(fx-off.x)*scaleX, cy=(fy-off.y)*scaleY;
    const cw=fw*scaleX, ch=fh*scaleY;
    return {
      x:Math.round(Math.max(0,Math.min(cx,f.nw-cw))),
      y:Math.round(Math.max(0,Math.min(cy,f.nh-ch))),
      w:Math.round(Math.min(cw,f.nw)), h:Math.round(Math.min(ch,f.nh))
    };
  },[]);
// Hi////
  // ── APPLY FRAME ──
  const applyFrame = useCallback((fx,fy,fw,fh,off,z)=>{
    const idx = activeIdx; if(idx<0||!files[idx]) return;
    const f = {x:fx,y:fy,w:fw,h:fh};
    setFrame(f); frameRef.current=f;
    drawOverlay(fx,fy,fw,fh);
    const cr = computeCropRect(files[idx],fx,fy,fw,fh,off,z);
    setCropRect(cr); cropRectRef.current=cr;
  },[activeIdx,files,drawOverlay,computeCropRect]);

  // ── PLACE FRAME ──
  const placeCropFrame = useCallback((p,off,z)=>{
    p   = p   ?? preset;
    off = off ?? imgOffRef.current;
    z   = z   ?? zoomRef.current;
    if(!p||!containerRef.current) return;
    const {offsetWidth:cw,offsetHeight:ch} = containerRef.current;
    const ratio=p.w/p.h; let fw,fh;
    if(cw/ch>ratio){fh=ch*0.88;fw=fh*ratio;}else{fw=cw*0.88;fh=fw/ratio;}
    applyFrame((cw-fw)/2,(ch-fh)/2,fw,fh,off,z);
  },[preset,applyFrame]);

  // ── UPLOAD ──
  const handleFiles = async(fileList)=>{
    const imgs=Array.from(fileList).filter(f=>f.type.startsWith('image/')); if(!imgs.length) return;
    setUploading(true);
    try{
      const previews = await Promise.all(imgs.map(file=>new Promise(res=>{
        const url=URL.createObjectURL(file), i=new Image();
        i.onload=()=>res({file,url,name:file.name,nw:i.naturalWidth,nh:i.naturalHeight,serverId:null});
        i.src=url;
      })));
      const fd=new FormData(); imgs.forEach(f=>fd.append('images',f));
      const {data}=await axios.post('/api/images/upload',fd,{headers:{'Content-Type':'multipart/form-data'}});
      const withIds=previews.map((p,i)=>({...p,serverId:data.images[i]._id}));
      setFiles(prev=>{
        const next=[...prev,...withIds];
        if(prev.length===0) setTimeout(()=>doLoadEditor(withIds[0],0),50);
        return next;
      });
      toast.success(`${withIds.length} image${withIds.length>1?'s':''} uploaded`);
    }catch(err){ toast.error(err.response?.data?.message||'Upload failed'); }
    finally{ setUploading(false); }
  };

  const removeFile=async(idx)=>{
    const f=files[idx];
    try{if(f.serverId)await axios.delete(`/api/images/${f.serverId}`); URL.revokeObjectURL(f.url);}catch{}
    setFiles(prev=>prev.filter((_,i)=>i!==idx));
    if(idx===activeIdx)setActiveIdx(-1);
  };

  // ── LOAD IMAGE ──
  const doLoadEditor = useCallback((f,idx)=>{
    if(!f) return;
    setActiveIdx(idx); zoomRef.current=1; setZoom(1);
    imgOffRef.current={x:0,y:0}; setImgOffset({x:0,y:0});
    frameRef.current={x:0,y:0,w:0,h:0}; setFrame({x:0,y:0,w:0,h:0});
    const img=imgRef.current; if(!img) return;
    img.onload=()=>{
      const c=containerRef.current; if(!c) return;
      const cw=c.offsetWidth, ch=c.offsetHeight;
      const imgR=f.nw/f.nh, conR=cw/ch;
      let nw,nh;
      if(imgR>conR){nw=cw*0.88;nh=nw/imgR;}else{nh=ch*0.88;nw=nh*imgR;}
      naturalSize.current={w:nw,h:nh};
      img.style.width=nw+'px'; img.style.height=nh+'px';
      const ox=Math.round((cw-nw)/2), oy=Math.round((ch-nh)/2);
      imgOffRef.current={x:ox,y:oy}; setImgOffset({x:ox,y:oy});
      img.style.left=ox+'px'; img.style.top=oy+'px';
      const oc=canvasRef.current; if(oc){oc.width=cw;oc.height=ch;}
      if(preset) requestAnimationFrame(()=>placeCropFrame(preset,{x:ox,y:oy},1));
    };
    img.src=f.url;
  },[preset,placeCropFrame]);

  // ── ZOOM ──
  const applyZoom=useCallback((newZ,px,py)=>{
    const c=containerRef.current; if(!c) return;
    const cw=c.offsetWidth,ch=c.offsetHeight;
    newZ=Math.max(0.2,Math.min(4,newZ));
    const ratio=newZ/zoomRef.current;
    px=px??cw/2; py=py??ch/2;
    const newOff={x:px-(px-imgOffRef.current.x)*ratio, y:py-(py-imgOffRef.current.y)*ratio};
    zoomRef.current=newZ; setZoom(newZ);
    imgOffRef.current=newOff; setImgOffset(newOff);
    const nw=naturalSize.current.w*newZ, nh=naturalSize.current.h*newZ;
    const img=imgRef.current;
    if(img){img.style.width=nw+'px';img.style.height=nh+'px';img.style.left=newOff.x+'px';img.style.top=newOff.y+'px';}
    if(frameRef.current.w>0) applyFrame(frameRef.current.x,frameRef.current.y,frameRef.current.w,frameRef.current.h,newOff,newZ);
  },[applyFrame]);

  const resetZoom=()=>{
    const c=containerRef.current; if(!c||!naturalSize.current.w) return;
    const cw=c.offsetWidth,ch=c.offsetHeight;
    const {w:nw,h:nh}=naturalSize.current;
    const ox=Math.round((cw-nw)/2),oy=Math.round((ch-nh)/2);
    zoomRef.current=1; setZoom(1);
    imgOffRef.current={x:ox,y:oy}; setImgOffset({x:ox,y:oy});
    const img=imgRef.current;
    if(img){img.style.width=nw+'px';img.style.height=nh+'px';img.style.left=ox+'px';img.style.top=oy+'px';}
    if(frameRef.current.w>0) applyFrame(frameRef.current.x,frameRef.current.y,frameRef.current.w,frameRef.current.h,{x:ox,y:oy},1);
  };

  useEffect(()=>{
    const el=containerRef.current; if(!el) return;
    const handler=e=>{
      if(activeIdx<0) return; e.preventDefault();
      const r=el.getBoundingClientRect();
      applyZoom(zoomRef.current-e.deltaY*0.001,e.clientX-r.left,e.clientY-r.top);
    };
    el.addEventListener('wheel',handler,{passive:false});
    return()=>el.removeEventListener('wheel',handler);
  },[activeIdx,applyZoom]);

  // ── DRAG ──
  const getCPos=e=>{
    const r=containerRef.current.getBoundingClientRect();
    const s=e.touches?e.touches[0]:e;
    return{x:s.clientX-r.left,y:s.clientY-r.top};
  };

  const startDrag=(e,mode)=>{
    e.preventDefault?.();
    const p=getCPos(e.touches?e:e);
    dragState.current={mode,startX:p.x,startY:p.y,baseOff:{...imgOffRef.current},baseFrame:{...frameRef.current}};
    setDragging(true);
  };

  const onPointerMove=useCallback(e=>{
    const ds=dragState.current; if(!ds) return;
    e.preventDefault?.();
    const s=e.touches?e.touches[0]:e;
    const r=containerRef.current.getBoundingClientRect();
    const px=s.clientX-r.left, py=s.clientY-r.top;
    const dx=px-ds.startX, dy=py-ds.startY;
    const c=containerRef.current;
    const cw=c.offsetWidth,ch=c.offsetHeight;
    const nw=naturalSize.current.w*zoomRef.current,nh=naturalSize.current.h*zoomRef.current;
    const {x:fx,y:fy,w:fw,h:fh}=frameRef.current;

    if(ds.mode==='pan'){
      let nx=ds.baseOff.x+dx, ny=ds.baseOff.y+dy;
      if(fw>0){nx=Math.max(fx+fw-nw,Math.min(fx,nx));ny=Math.max(fy+fh-nh,Math.min(fy,ny));}
      imgOffRef.current={x:nx,y:ny}; setImgOffset({x:nx,y:ny});
      const img=imgRef.current;
      if(img){img.style.left=nx+'px';img.style.top=ny+'px';}
      if(fw>0) applyFrame(fx,fy,fw,fh,{x:nx,y:ny},zoomRef.current);
      return;
    }
    if(ds.mode==='move'){
      const nx=Math.max(0,Math.min(cw-ds.baseFrame.w,ds.baseFrame.x+dx));
      const ny=Math.max(0,Math.min(ch-ds.baseFrame.h,ds.baseFrame.y+dy));
      applyFrame(nx,ny,ds.baseFrame.w,ds.baseFrame.h,imgOffRef.current,zoomRef.current);
      return;
    }
    // Resize
    let{x,y,w,h}=ds.baseFrame; const hnd=ds.mode;
    if(hnd.includes('l')){const nw2=Math.max(MIN_FRAME,w-dx);x=x+w-nw2;w=nw2;}
    if(hnd==='rc'||hnd==='tr'||hnd==='br'){w=Math.max(MIN_FRAME,w+dx);}
    if(hnd==='tc'||hnd==='tl'||hnd==='tr'){const nh2=Math.max(MIN_FRAME,h-dy);y=y+h-nh2;h=nh2;}
    if(hnd==='bc'||hnd==='bl'||hnd==='br'){h=Math.max(MIN_FRAME,h+dy);}
    x=Math.max(0,Math.min(x,cw-MIN_FRAME)); y=Math.max(0,Math.min(y,ch-MIN_FRAME));
    w=Math.min(w,cw-x); h=Math.min(h,ch-y);
    applyFrame(x,y,w,h,imgOffRef.current,zoomRef.current);
  },[applyFrame]);

  const endDrag=useCallback(()=>{ dragState.current=null; setDragging(false); },[]);

  useEffect(()=>{
    window.addEventListener('mousemove',onPointerMove);
    window.addEventListener('mouseup',endDrag);
    window.addEventListener('touchmove',onPointerMove,{passive:false});
    window.addEventListener('touchend',endDrag);
    return()=>{
      window.removeEventListener('mousemove',onPointerMove);
      window.removeEventListener('mouseup',endDrag);
      window.removeEventListener('touchmove',onPointerMove);
      window.removeEventListener('touchend',endDrag);
    };
  },[onPointerMove,endDrag]);

  // Pinch
  const onContainerTouchStart=e=>{
    if(e.touches.length===2)
      lastPinch.current=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
  };
  const onContainerTouchMove=e=>{
    if(e.touches.length===2){
      e.preventDefault();
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      const r=containerRef.current.getBoundingClientRect();
      applyZoom(zoomRef.current*(d/lastPinch.current),(e.touches[0].clientX+e.touches[1].clientX)/2-r.left,(e.touches[0].clientY+e.touches[1].clientY)/2-r.top);
      lastPinch.current=d;
    }
  };

  // ── ADJUSTMENTS ──
  const updateAdj=(k,v)=>setAdj(p=>({...p,[k]:v}));
  const resetAdj=()=>{setAdj({...ADJ_DEFAULTS});setActiveFilter(0);};
  const applyFilter=i=>{setAdj({...ADJ_DEFAULTS,...FILTERS[i].vals});setActiveFilter(i);};

  // ── PIXEL-LEVEL EXPORT ──
  const buildCanvas=(srcImg,sx,sy,sw,sh,dw,dh)=>{
    const cv=document.createElement('canvas'); cv.width=Math.round(dw); cv.height=Math.round(dh);
    const ctx=cv.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(srcImg,sx,sy,sw,sh,0,0,dw,dh);
    const id=ctx.getImageData(0,0,cv.width,cv.height); const d=id.data;
    const br=adj.brightness/100,ct=adj.contrast/100,sat=1+adj.saturation/100,exp=adj.exposure/100;
    const temp=adj.temperature/200,tint=adj.tint/200,hl=adj.highlights/200,sh2=adj.shadows/200;
    const ctf=ct>0?1+ct*2:1+ct;
    for(let i=0;i<d.length;i+=4){
      let r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255;
      r+=exp;g+=exp;b+=exp; r+=br;g+=br;b+=br;
      r=(r-0.5)*ctf+0.5;g=(g-0.5)*ctf+0.5;b=(b-0.5)*ctf+0.5;
      const lum=0.299*r+0.587*g+0.114*b;
      if(lum>0.5){const m=(lum-0.5)*2*hl;r+=m;g+=m;b+=m;}
      else{const m=(0.5-lum)*2*sh2;r+=m;g+=m;b+=m;}
      r+=temp;b-=temp*0.7;g+=tint;
      const gray=0.299*r+0.587*g+0.114*b;
      r=gray+(r-gray)*sat;g=gray+(g-gray)*sat;b=gray+(b-gray)*sat;
      d[i]=Math.max(0,Math.min(255,r*255));d[i+1]=Math.max(0,Math.min(255,g*255));d[i+2]=Math.max(0,Math.min(255,b*255));
    }
    ctx.putImageData(id,0,0);
    if(adj.vignette>0){
      const v=adj.vignette/100;
      const gr=ctx.createRadialGradient(dw/2,dh/2,dw*0.3,dw/2,dh/2,dw*0.9);
      gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,`rgba(0,0,0,${v*0.75})`);
      ctx.fillStyle=gr;ctx.fillRect(0,0,dw,dh);
    }
    return cv;
  };

  const performCrop=(fileObj,rect)=>new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      let sx=rect?.x??0,sy=rect?.y??0,sw=rect?.w??img.naturalWidth,sh=rect?.h??img.naturalHeight;
      let dw,dh;
      if(preset){dw=preset.w*dpi;dh=preset.h*dpi;
        if(!rect){const ratio=preset.w/preset.h,ir=img.naturalWidth/img.naturalHeight;
          if(ir>ratio){sh=img.naturalHeight;sw=sh*ratio;sx=(img.naturalWidth-sw)/2;sy=0;}
          else{sw=img.naturalWidth;sh=sw/ratio;sx=0;sy=(img.naturalHeight-sh)/2;}
        }
      }else{dw=sw;dh=sh;}
      const cv=buildCanvas(img,sx,sy,sw,sh,dw,dh);
      const fmtMap={jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
      cv.toBlob(blob=>resolve(blob),fmtMap[format],quality);
    };
    img.src=fileObj.url;
  });

  const dlBlob=(blob,name)=>{
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();
    document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),5000);
  };

  const cropCurrent=async()=>{
    if(activeIdx<0)return;
    const f=files[activeIdx]; const ext=format==='jpeg'?'jpg':format;
    const base=f.name.replace(/\.[^.]+$/,'');
    const name=preset?`${base}_${preset.w}x${preset.h}.${ext}`:`${base}_crop.${ext}`;
    const blob=await performCrop(f,cropRectRef.current);
    try{
      const cr=cropRectRef.current;
      await axios.post('/api/crops',{
        imageId:f.serverId,cropX:cr?.x??0,cropY:cr?.y??0,
        cropWidth:cr?.w??f.nw,cropHeight:cr?.h??f.nh,
        outputWidth:preset?preset.w*dpi:f.nw,outputHeight:preset?preset.h*dpi:f.nh,
        sizeLabel:preset?`${preset.w}x${preset.h}`:'custom',
        format,quality:Math.round(quality*100),dpi,
      });
    }catch{}
    dlBlob(blob,name); toast.success('Crop downloaded!');
  };

  const cropAll=async()=>{
    if(!preset||files.length===0)return;
    setActiveTab('bulk');
    setBulkResults(files.map((f,i)=>({...f,status:'pending',blob:null,idx:i})));
    for(let i=0;i<files.length;i++){
      setBulkResults(p=>p.map((r,j)=>j===i?{...r,status:'processing'}:r));
      const blob=await performCrop(files[i],null);
      setBulkResults(p=>p.map((r,j)=>j===i?{...r,status:'done',blob}:r));
    }
    toast.success('All done!');
  };

  const activeFile=files[activeIdx];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'var(--bg)'}}>

      {/* HEADER */}
      <header style={{height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',borderBottom:'1px solid var(--border)',background:'var(--surface)',flexShrink:0}}>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:19}}>Crop<span style={{color:'var(--accent)'}}>Forge</span></div>
          <div style={{fontFamily:'DM Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:2,textTransform:'uppercase'}}>Precision Crop &amp; Adjust</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
=======
  // Files state
  const [files,      setFiles]      = useState([]);  // { id, name, nw, nh, url (local preview), serverId }
  const [activeIdx,  setActiveIdx]  = useState(-1);
  const [uploading,  setUploading]  = useState(false);

  // Crop settings
  const [preset,   setPreset]   = useState(null);
  const [quality,  setQuality]  = useState(0.95);
  const [format,   setFormat]   = useState('jpeg');
  const [dpi,      setDpi]      = useState(300);
  const [customW,  setCustomW]  = useState('');
  const [customH,  setCustomH]  = useState('');

  // Frame position (display px)
  const [frame, setFrame] = useState({ x:0, y:0, w:0, h:0 });

  // Refs
  const imgRef       = useRef(null);
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const frameRef     = useRef(null);
  const dragging     = useRef(false);
  const dragOff      = useRef({ x:0, y:0 });
  const frameState   = useRef(frame);
  frameState.current = frame;

  // ── UPLOAD ──
  const handleFiles = async (fileList) => {
    const imgs = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!imgs.length) return;
    setUploading(true);
    try {
      // Build local previews immediately
      const previews = await Promise.all(imgs.map(file => new Promise(res => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => res({ file, url, name: file.name, nw: img.naturalWidth, nh: img.naturalHeight, serverId: null });
        img.src = url;
      })));

      // Upload to server
      const fd = new FormData();
      imgs.forEach(f => fd.append('images', f));
      const { data } = await axios.post('/api/images/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      // Attach server IDs
      const withIds = previews.map((p, i) => ({ ...p, serverId: data.images[i]._id }));
      setFiles(prev => {
        const next = [...prev, ...withIds];
        if (prev.length === 0) setActiveIdx(0);
        return next;
      });
      toast.success(`${withIds.length} image${withIds.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (idx) => {
    const f = files[idx];
    try {
      if (f.serverId) await axios.delete(`/api/images/${f.serverId}`);
      URL.revokeObjectURL(f.url);
    } catch {}
    setFiles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setActiveIdx(ai => {
        const newIdx = ai >= next.length ? next.length - 1 : ai;
        return newIdx;
      });
      return next;
    });
  };

  // ── PLACE FRAME ──
  const placeFrame = useCallback((p = preset) => {
    if (!p || !imgRef.current) return;
    const iw = imgRef.current.offsetWidth;
    const ih = imgRef.current.offsetHeight;
    if (!iw || !ih) return;
    const ratio = p.w / p.h;
    const ir    = iw / ih;
    let fw, fh;
    if (ir > ratio) { fh = ih * 0.88; fw = fh * ratio; }
    else            { fw = iw * 0.88; fh = fw / ratio; }
    const fx = (iw - fw) / 2;
    const fy = (ih - fh) / 2;
    setFrame({ x: fx, y: fy, w: fw, h: fh });
  }, [preset]);

  // Redraw outside overlay whenever frame changes
  useEffect(() => {
    if (!canvasRef.current || !imgRef.current || frame.w === 0) return;
    const oc  = canvasRef.current;
    const ctx = oc.getContext('2d');
    const iw  = oc.width;
    const ih  = oc.height;
    ctx.clearRect(0, 0, iw, ih);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, iw, ih);
    ctx.clearRect(frame.x, frame.y, frame.w, frame.h);
  }, [frame]);

  // ── DRAG ──
  const onMouseDown = (e) => {
    dragging.current = true;
    const rect = imgRef.current.getBoundingClientRect();
    dragOff.current = {
      x: e.clientX - rect.left - frameState.current.x,
      y: e.clientY - rect.top  - frameState.current.y,
    };
    e.stopPropagation();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !imgRef.current) return;
      const rect = imgRef.current.getBoundingClientRect();
      const iw   = imgRef.current.offsetWidth;
      const ih   = imgRef.current.offsetHeight;
      const cx   = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy   = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      const nx   = Math.max(0, Math.min(cx - dragOff.current.x, iw - frameState.current.w));
      const ny   = Math.max(0, Math.min(cy - dragOff.current.y, ih - frameState.current.h));
      setFrame(prev => ({ ...prev, x: nx, y: ny }));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend',  onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend',  onUp);
    };
  }, []);

  // ── LOAD IMAGE INTO EDITOR ──
  const loadImage = (idx) => {
    setActiveIdx(idx);
    setFrame({ x:0, y:0, w:0, h:0 });
  };

  const onImageLoad = () => {
    const img = imgRef.current;
    if (!img || !containerRef.current) return;
    containerRef.current.style.width  = img.offsetWidth  + 'px';
    containerRef.current.style.height = img.offsetHeight + 'px';
    canvasRef.current.width  = img.offsetWidth;
    canvasRef.current.height = img.offsetHeight;
    canvasRef.current.style.width  = img.offsetWidth  + 'px';
    canvasRef.current.style.height = img.offsetHeight + 'px';
    if (preset) requestAnimationFrame(() => placeFrame());
  };

  // Re-place frame when preset changes
  useEffect(() => {
    if (preset && activeIdx >= 0 && imgRef.current?.offsetWidth)
      requestAnimationFrame(() => placeFrame(preset));
  }, [preset, placeFrame, activeIdx]);

  // ── CROP ──
  const doCrop = async () => {
    const f = files[activeIdx];
    if (!f?.serverId || !preset || frame.w === 0) return;
    const img     = imgRef.current;
    const scaleX  = f.nw / img.offsetWidth;
    const scaleY  = f.nh / img.offsetHeight;

    try {
      const { data } = await axios.post('/api/crops', {
        imageId:      f.serverId,
        cropX:        Math.round(frame.x * scaleX),
        cropY:        Math.round(frame.y * scaleY),
        cropWidth:    Math.round(frame.w * scaleX),
        cropHeight:   Math.round(frame.h * scaleY),
        outputWidth:  preset.w * dpi,
        outputHeight: preset.h * dpi,
        sizeLabel:    `${preset.w}x${preset.h}`,
        format, quality: Math.round(quality * 100), dpi,
      });
      // Trigger download
      window.location.href = data.downloadUrl;
      toast.success('Crop saved & downloading!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Crop failed');
    }
  };

  const doBulkCrop = async () => {
    if (!preset || files.length === 0) return;
    const img = imgRef.current;
    const jobs = files.filter(f => f.serverId).map(f => {
      const scaleX = f.nw / (img?.offsetWidth  || 1);
      const scaleY = f.nh / (img?.offsetHeight || 1);
      const ratio  = preset.w / preset.h;
      const ir     = f.nw / f.nh;
      let cx, cy, cw, ch;
      if (ir > ratio) { ch = f.nh; cw = ch * ratio; cx = (f.nw - cw) / 2; cy = 0; }
      else            { cw = f.nw; ch = cw / ratio; cx = 0; cy = (f.nh - ch) / 2; }
      return { imageId: f.serverId, cropX: cx, cropY: cy, cropWidth: cw, cropHeight: ch,
        outputWidth: preset.w * dpi, outputHeight: preset.h * dpi,
        sizeLabel: `${preset.w}x${preset.h}`, format, quality: Math.round(quality * 100), dpi };
    });

    const t = toast.loading(`Cropping ${jobs.length} images…`);
    try {
      const { data } = await axios.post('/api/crops/bulk', { jobs });
      toast.success(`${data.results.length} crops done!`, { id: t });
      // Download first result as demo
      if (data.results[0]?.downloadUrl) window.location.href = data.results[0].downloadUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk crop failed', { id: t });
    }
  };

  const applyCustom = () => {
    const w = parseFloat(customW), h = parseFloat(customH);
    if (!w || !h) return;
    setPreset({ label: `${w}" × ${h}"`, w, h });
  };

  const activeFile = files[activeIdx];
  const iw = imgRef.current?.offsetWidth  || 0;
  const ih = imgRef.current?.offsetHeight || 0;
  const cropPxW = activeFile ? Math.round(frame.w * (activeFile.nw / (iw || 1))) : 0;
  const cropPxH = activeFile ? Math.round(frame.h * (activeFile.nh / (ih || 1))) : 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      {/* Header */}
      <div className="app-header">
        <div className="header-logo">Crop<span>Forge</span></div>
        <div className="header-nav">
>>>>>>> 5421cf09b210f0223df7bfcf6f1af66e9ebf9ff5
          <Link to="/"        className="nav-btn active">Editor</Link>
          <Link to="/history" className="nav-btn">History</Link>
          <span className="user-badge">👤 {user?.name}</span>
          <button className="nav-btn" onClick={logout}>Sign Out</button>
        </div>
<<<<<<< HEAD
      </header>

      <div style={{display:'grid',gridTemplateColumns:'290px 1fr 260px',flex:1,overflow:'hidden'}}>

        {/* LEFT SIDEBAR */}
        <div className="sidebar">
          <div>
            <div className="sec-label">Upload Images</div>
            <div className={`drop-zone${uploading?' over':''}`}
              onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFiles(e.dataTransfer.files);}}>
              <input type="file" accept="image/*" multiple onChange={e=>handleFiles(e.target.files)}/>
              <span className="dz-icon">{uploading?'⏳':'🗂'}</span>
              <div className="dz-title">{uploading?'Uploading…':'Drop images here'}</div>
              <div className="dz-sub">or click to browse<br/>JPG · PNG · WEBP · TIFF</div>
            </div>
          </div>

          {files.length>0&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <div className="sec-label" style={{margin:0}}>Files <span style={{color:'var(--accent)'}}>{files.length}</span></div>
                <button style={{background:'none',border:'none',fontFamily:'DM Mono,monospace',fontSize:9,color:'var(--muted)',cursor:'pointer',textDecoration:'underline'}}
                  onClick={()=>{files.forEach(f=>URL.revokeObjectURL(f.url));setFiles([]);setActiveIdx(-1);}}>clear all</button>
              </div>
              <div className="file-list">
                {files.map((f,i)=>(
                  <div key={f.url} className={`file-item${i===activeIdx?' active':''}`} onClick={()=>doLoadEditor(f,i)}>
                    <img className="file-thumb" src={f.url} alt=""/>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="file-name">{f.name}</div>
                      <div className="file-dims">{f.nw} × {f.nh} px</div>
                    </div>
                    <button className="file-remove" onClick={e=>{e.stopPropagation();removeFile(i);}}>✕</button>
=======
      </div>

      <div className="app-layout" style={{ gridTemplateColumns:'300px 1fr', flex:1, overflow:'hidden' }}>

        {/* Sidebar */}
        <div className="sidebar">

          <div>
            <div className="sec-label">Upload Images</div>
            <div className={`drop-zone${uploading ? ' over' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
              <input type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} />
              <span className="dz-icon">{uploading ? '⏳' : '🗂'}</span>
              <div className="dz-title">{uploading ? 'Uploading…' : 'Drop images here'}</div>
              <div className="dz-sub">or click to browse<br />JPG · PNG · WEBP · TIFF</div>
            </div>
          </div>

          {files.length > 0 && (
            <div>
              <div className="sec-label">Files <span style={{color:'var(--accent)'}}>{files.length}</span></div>
              <div className="file-list">
                {files.map((f, i) => (
                  <div key={f.url} className={`file-item${i === activeIdx ? ' active' : ''}`} onClick={() => loadImage(i)}>
                    <img className="file-thumb" src={f.url} alt="" />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="file-name">{f.name}</div>
                      <div className="file-dims">{f.nw} × {f.nh} px</div>
                    </div>
                    <button className="file-remove" onClick={e => { e.stopPropagation(); removeFile(i); }}>✕</button>
>>>>>>> 5421cf09b210f0223df7bfcf6f1af66e9ebf9ff5
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
<<<<<<< HEAD
            <div className="sec-label">Crop Size</div>
            <div className="preset-grid">
              {PRESETS.map(p=>(
                <button key={p.label} className={`preset-btn${preset?.label===p.label?' selected':''}`}
                  onClick={()=>{setPreset(p);if(activeIdx>=0)setTimeout(()=>placeCropFrame(p),0);}}>
=======
            <div className="sec-label">Crop Size — click to apply</div>
            <div className="preset-grid">
              {PRESETS.map(p => (
                <button key={p.label} className={`preset-btn${preset?.label === p.label ? ' selected' : ''}`}
                  onClick={() => setPreset(p)}>
>>>>>>> 5421cf09b210f0223df7bfcf6f1af66e9ebf9ff5
                  <span className="preset-name">{p.label}</span>
                  <span className="preset-ratio">{p.w}:{p.h}</span>
                </button>
              ))}
            </div>
<<<<<<< HEAD
            <div style={{marginTop:9}}>
              <div className="sec-label">Custom (inches)</div>
              <div className="custom-row">
                <input className="sz-input" type="number" placeholder="W" value={customW} onChange={e=>setCustomW(e.target.value)}/>
                <span style={{color:'var(--muted)'}}>×</span>
                <input className="sz-input" type="number" placeholder="H" value={customH} onChange={e=>setCustomH(e.target.value)}/>
                <button className="sz-set" onClick={()=>{
                  const w=parseFloat(customW),h=parseFloat(customH); if(!w||!h)return;
                  const p={label:`${w}"×${h}"`,w,h}; setPreset(p);
                  if(activeIdx>=0)setTimeout(()=>placeCropFrame(p),0);
                }}>Set</button>
=======
            <div style={{ marginTop:10 }}>
              <div className="sec-label">Custom (inches)</div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:7, padding:'8px 10px', color:'var(--text)', fontFamily:'DM Mono,monospace', fontSize:11, outline:'none' }}
                  type="number" placeholder="W" value={customW} onChange={e => setCustomW(e.target.value)} />
                <span style={{ color:'var(--muted)' }}>×</span>
                <input style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:7, padding:'8px 10px', color:'var(--text)', fontFamily:'DM Mono,monospace', fontSize:11, outline:'none' }}
                  type="number" placeholder="H" value={customH} onChange={e => setCustomH(e.target.value)} />
                <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:7, color:'var(--text)', fontFamily:'DM Mono,monospace', fontSize:10, padding:'8px 10px', cursor:'pointer' }}
                  onClick={applyCustom}>Set</button>
>>>>>>> 5421cf09b210f0223df7bfcf6f1af66e9ebf9ff5
              </div>
            </div>
          </div>

          <div>
<<<<<<< HEAD
            <div className="sec-label">Export</div>
            <div className="setting-row">
              <div className="setting-label">Quality</div>
              <select className="sel" value={quality} onChange={e=>setQuality(parseFloat(e.target.value))}>
                <option value="1.0">Max 100%</option><option value="0.95">High 95%</option><option value="0.85">Good 85%</option><option value="0.7">Med 70%</option>
              </select>
            </div>
            <div className="setting-row">
              <div className="setting-label">Format</div>
              <select className="sel" value={format} onChange={e=>setFormat(e.target.value)}>
                <option value="jpeg">JPEG</option><option value="png">PNG</option><option value="webp">WEBP</option>
              </select>
            </div>
            <div className="setting-row">
              <div><div className="setting-label">DPI</div><div className="setting-sub">Print resolution</div></div>
              <select className="sel" value={dpi} onChange={e=>setDpi(parseInt(e.target.value))}>
                <option value="72">72 Screen</option><option value="150">150 Draft</option><option value="300">300 Print</option><option value="600">600 Pro</option>
              </select>
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:'auto'}}>
            <button className="btn btn-p" onClick={cropCurrent} disabled={!activeFile?.serverId||!preset||!cropRectRef.current}>✂ Crop &amp; Download</button>
            <button className="btn btn-s" onClick={cropAll}     disabled={files.length===0||!preset}>⚡ Crop All (Bulk)</button>
          </div>
        </div>

        {/* CANVAS */}
        <div style={{background:'var(--bg)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',gap:2,padding:'10px 20px 0',borderBottom:'1px solid var(--border)',flexShrink:0}}>
            {['editor','bulk'].map(t=>(
              <button key={t} className={`tab${activeTab===t?' active':''}`} onClick={()=>setActiveTab(t)}>
                {t==='editor'?'Editor':'Bulk Results'}
              </button>
            ))}
          </div>

          {activeTab==='editor'&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 40px 12px',overflow:'hidden',minHeight:0,gap:8}}>
              {!activeFile?(
                <div className="empty-state">
                  <span className="empty-icon">🖼</span>
                  <div className="empty-title">No image loaded</div>
                  <div className="empty-sub">Upload an image and pick a crop size. <strong style={{color:'var(--accent)'}}>Drag the photo</strong> to pan, <strong style={{color:'var(--accent2)'}}>drag the handles</strong> to resize the frame, and <strong style={{color:'var(--accent)'}}>scroll to zoom</strong>.</div>
                </div>
              ):(
                <>
                  {/* Image container */}
                  <div ref={containerRef}
                    style={{position:'relative',flex:1,width:'100%',minHeight:0,overflow:'hidden',borderRadius:4,boxShadow:'0 0 0 1px var(--border), 0 16px 50px rgba(0,0,0,0.5)'}}
                    onTouchStart={onContainerTouchStart} onTouchMove={onContainerTouchMove}>

                    <img ref={imgRef} src={activeFile.url} alt="" draggable={false}
                      style={{position:'absolute',cursor:dragging&&dragState.current?.mode==='pan'?'grabbing':'grab',filter:cssFilter,userSelect:'none',borderRadius:2}}
                      onMouseDown={e=>{e.preventDefault();startDrag(e,'pan');}}
                      onTouchStart={e=>{if(e.touches.length===1){e.stopPropagation();startDrag(e,'pan');}}}/>

                    <canvas ref={canvasRef} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:1,borderRadius:4}}/>

                    {/* Cut lines */}
                    {frame.w>0&&<>
                      <div style={{position:'absolute',top:frame.y,        left:0,right:0, height:'1.5px',background:'var(--accent)',opacity:.65,pointerEvents:'none',zIndex:2}}/>
                      <div style={{position:'absolute',top:frame.y+frame.h,left:0,right:0, height:'1.5px',background:'var(--accent)',opacity:.65,pointerEvents:'none',zIndex:2}}/>
                      <div style={{position:'absolute',left:frame.x,         top:0,bottom:0,width:'1.5px', background:'var(--accent)',opacity:.65,pointerEvents:'none',zIndex:2}}/>
                      <div style={{position:'absolute',left:frame.x+frame.w, top:0,bottom:0,width:'1.5px', background:'var(--accent)',opacity:.65,pointerEvents:'none',zIndex:2}}/>
                    </>}

                    {/* Crop frame */}
                    {frame.w>0&&(
                      <div style={{position:'absolute',left:frame.x,top:frame.y,width:frame.w,height:frame.h,zIndex:3}}>
                        <div style={{position:'absolute',inset:0,border:'2px solid var(--accent)',borderRadius:1,pointerEvents:'none'}}/>
                        <div style={{position:'absolute',inset:0,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gridTemplateRows:'repeat(3,1fr)',pointerEvents:'none'}}>
                          {[...Array(9)].map((_,i)=><span key={i} style={{border:'1px solid rgba(232,255,71,0.12)'}}/>)}
                        </div>
                        <div style={{position:'absolute',top:-28,left:'50%',transform:'translateX(-50%)',background:'var(--accent)',color:'#0d0d0f',fontFamily:'DM Mono,monospace',fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:4,whiteSpace:'nowrap',pointerEvents:'none',boxShadow:'0 2px 8px rgba(0,0,0,0.5)'}}>
                          {preset?`${preset.w}" × ${preset.h}"`:`${cropRect?.w}×${cropRect?.h}px`}
                        </div>
                        <div style={{position:'absolute',bottom:-20,left:'50%',transform:'translateX(-50%)',fontFamily:'DM Mono,monospace',fontSize:8,color:'var(--accent)',background:'rgba(13,13,15,0.9)',padding:'2px 6px',borderRadius:3,border:'1px solid rgba(232,255,71,0.2)',whiteSpace:'nowrap',pointerEvents:'none'}}>{cropRect?.w} px</div>
                        <div style={{position:'absolute',right:-50,top:'50%',transform:'translateY(-50%)',fontFamily:'DM Mono,monospace',fontSize:8,color:'var(--accent)',background:'rgba(13,13,15,0.9)',padding:'2px 6px',borderRadius:3,border:'1px solid rgba(232,255,71,0.2)',whiteSpace:'nowrap',pointerEvents:'none'}}>{cropRect?.h} px</div>
                        {/* Move zone */}
                        <div style={{position:'absolute',inset:18,cursor:dragging&&dragState.current?.mode==='move'?'grabbing':'move',zIndex:4}}
                          onMouseDown={e=>{e.stopPropagation();e.preventDefault();startDrag(e,'move');}}
                          onTouchStart={e=>{e.stopPropagation();e.preventDefault();startDrag(e,'move');}}/>
                        {/* 8 handles */}
                        {HANDLES.map(({id,style})=>(
                          <div key={id} style={{position:'absolute',width:12,height:12,background:'var(--accent)',borderRadius:2,zIndex:5,...style}}
                            onMouseDown={e=>{e.stopPropagation();e.preventDefault();startDrag(e,id);}}
                            onTouchStart={e=>{e.stopPropagation();e.preventDefault();startDrag(e,id);}}/>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Zoom bar */}
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,width:'100%',flexShrink:0}}>
                    <button className="zoom-btn" onClick={()=>applyZoom(zoom-.1)}>−</button>
                    <input type="range" style={{flex:1}} min=".2" max="4" step=".05" value={zoom} onChange={e=>applyZoom(parseFloat(e.target.value))}/>
                    <button className="zoom-btn" onClick={()=>applyZoom(zoom+.1)}>+</button>
                    <span style={{fontFamily:'DM Mono,monospace',fontSize:9,color:'var(--accent)',minWidth:36,textAlign:'center'}}>{Math.round(zoom*100)}%</span>
                    <button className="zoom-btn" title="Fit" onClick={resetZoom}>⊡</button>
                  </div>

                  {/* Info bar */}
                  <div style={{display:'flex',gap:14,padding:'6px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,fontFamily:'DM Mono,monospace',fontSize:9,color:'var(--muted)',flexShrink:0,width:'100%',flexWrap:'wrap'}}>
                    <span>ORIG <span style={{color:'var(--accent2)'}}>{activeFile.nw}×{activeFile.nh}</span></span>
                    <span>SIZE <span style={{color:'var(--accent)'}}>{preset?`${preset.w}"×${preset.h}"`:'—'}</span></span>
                    <span>OUT <span style={{color:'var(--text)'}}>{preset?`${preset.w*dpi}×${preset.h*dpi}px`:'—'}</span></span>
                    <span>ZOOM <span style={{color:'var(--accent)'}}>{Math.round(zoom*100)}%</span></span>
                    <span>POS <span style={{color:'var(--text)'}}>x:{cropRect?.x??0} y:{cropRect?.y??0}</span></span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab==='bulk'&&(
            <div style={{flex:1,overflowY:'auto',padding:18,display:'flex',flexDirection:'column',gap:6}}>
              {bulkResults.length===0
                ?<div style={{textAlign:'center',color:'var(--muted)',padding:'50px 20px',fontSize:12}}><span style={{fontSize:32,opacity:.15,display:'block',marginBottom:12}}>⚡</span>Run "Crop All" to process all images.</div>
                :bulkResults.map((r,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7}}>
                    <img src={r.url} alt="" style={{width:34,height:34,objectFit:'cover',borderRadius:4}}/>
                    <div style={{flex:1,fontSize:10,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{r.name}</div>
                    <span style={{fontFamily:'DM Mono,monospace',fontSize:8,padding:'2px 6px',borderRadius:3,background:r.status==='done'?'rgba(71,255,138,0.1)':r.status==='processing'?'rgba(71,255,224,0.1)':'rgba(255,255,255,0.05)',color:r.status==='done'?'var(--success)':r.status==='processing'?'var(--accent2)':'var(--muted)'}}>{r.status.toUpperCase()}</span>
                    <button disabled={r.status!=='done'} style={{background:'var(--accent)',color:'#0d0d0f',border:'none',borderRadius:5,padding:'4px 9px',fontFamily:'DM Mono,monospace',fontSize:8,fontWeight:700,cursor:r.status==='done'?'pointer':'not-allowed',opacity:r.status==='done'?1:.3}}
                      onClick={()=>{const ext=format==='jpeg'?'jpg':format;dlBlob(r.blob,`${r.name.replace(/\.[^.]+$/,'')}_${preset?.w}x${preset?.h}.${ext}`);}}>↓ Save</button>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR — ADJUSTMENTS */}
        <div className="sidebar" style={{borderLeft:'1px solid var(--border)',borderRight:'none'}}>
          {/* Histogram */}
          <div>
            <div className="sec-label">Histogram</div>
            <div style={{height:48,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,overflow:'hidden',display:'flex',alignItems:'flex-end',gap:1,padding:'4px 4px 0',marginBottom:14}}>
              {[...Array(24)].map((_,i)=>{
                const t=i/23, peak=0.5+adj.brightness/300+adj.exposure/300;
                const h=Math.max(4,Math.min(100,Math.exp(-Math.pow((t-peak)/.35,2))*85));
                const col=adj.temperature>20?'rgba(255,180,80,0.5)':adj.temperature<-20?'rgba(80,160,255,0.5)':'rgba(232,255,71,0.35)';
                return<div key={i} style={{flex:1,height:h+'%',background:col,borderRadius:'1px 1px 0 0'}}/>;
              })}
            </div>
          </div>

          {/* Tone */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <div className="sec-label" style={{margin:0}}>Tone</div>
              <button className="adj-reset" onClick={resetAdj}>Reset all</button>
            </div>
            {SLIDERS.map(s=>(
              <div key={s.key} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontFamily:'DM Mono,monospace',fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:1}}>{s.label}</span>
                  <span style={{fontFamily:'DM Mono,monospace',fontSize:9,color:'var(--accent)'}}>{adj[s.key]>=0&&s.min<0?'+':''}{adj[s.key]}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step="1" value={adj[s.key]} onChange={e=>updateAdj(s.key,parseFloat(e.target.value))}/>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div>
            <div className="sec-label">Quick Filters</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
              {FILTERS.map((f,i)=>(
                <button key={f.name} className={`filter-btn${activeFilter===i?' active':''}`} onClick={()=>applyFilter(i)}>{f.name}</button>
              ))}
            </div>
          </div>

          {/* Transform */}
          <div>
            <div className="sec-label">Transform</div>
            <div style={{display:'flex',gap:5}}>
              {[['↺','Rotate L'],['↻','Rotate R'],['⇄','Flip H'],['⇅','Flip V']].map(([icon,title])=>(
                <button key={title} className="tf-btn" title={title}>{icon}</button>
              ))}
            </div>
          </div>

          <div style={{marginTop:'auto'}}>
            <button className="btn btn-p" onClick={cropCurrent} disabled={!activeFile?.serverId||!cropRectRef.current}>✦ Apply &amp; Download</button>
            <div style={{fontFamily:'DM Mono,monospace',fontSize:8,color:'var(--muted)',marginTop:8,textAlign:'center',lineHeight:1.6}}>
              Bakes adjustments + crop at full resolution
            </div>
          </div>
        </div>

=======
            <div className="sec-label">Export Settings</div>
            {[
              { label:'Quality', sub: null, id:'q',
                el: <select className="setting-select" value={quality} onChange={e => setQuality(parseFloat(e.target.value))}>
                  <option value="1.0">Max 100%</option><option value="0.95">High 95%</option>
                  <option value="0.85">Good 85%</option><option value="0.7">Med 70%</option>
                </select> },
              { label:'Format', sub: null, id:'f',
                el: <select className="setting-select" value={format} onChange={e => setFormat(e.target.value)}>
                  <option value="jpeg">JPEG</option><option value="png">PNG</option><option value="webp">WEBP</option>
                </select> },
              { label:'DPI', sub: 'Print resolution', id:'d',
                el: <select className="setting-select" value={dpi} onChange={e => setDpi(parseInt(e.target.value))}>
                  <option value="72">72 Screen</option><option value="150">150 Draft</option>
                  <option value="300">300 Print</option><option value="600">600 Pro</option>
                </select> },
            ].map(({ label, sub, id, el }) => (
              <div className="setting-row" key={id}>
                <div><div className="setting-label">{label}</div>{sub && <div className="setting-sub">{sub}</div>}</div>
                {el}
              </div>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:'auto' }}>
            <button className="btn-primary" onClick={doCrop}
              disabled={!activeFile?.serverId || !preset || frame.w === 0}>
              ✂ Crop &amp; Download
            </button>
            <button className="btn-secondary" onClick={doBulkCrop}
              disabled={files.length === 0 || !preset}>
              ⚡ Crop All (Bulk)
            </button>
          </div>

        </div>

        {/* Canvas */}
        <div className="canvas-area">
          <div className="editor-wrap">
            {!activeFile ? (
              <div className="empty-state">
                <span className="empty-icon">🖼</span>
                <div className="empty-title">No image loaded</div>
                <div className="empty-sub">Upload images on the left, click a size button — the crop frame appears. Drag it to reposition.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, width:'100%', flex:1, minHeight:0, justifyContent:'center' }}>
                <div className="img-container" ref={containerRef}>
                  <img ref={imgRef} className="crop-image" src={activeFile.url} alt="" onLoad={onImageLoad} draggable={false} />
                  <canvas ref={canvasRef} className="outside-canvas" />

                  {/* Cut guide lines */}
                  {frame.w > 0 && <>
                    <div className="cut-line" style={{ top: frame.y,          left:0, right:0, height:'1.5px' }} />
                    <div className="cut-line" style={{ top: frame.y+frame.h,  left:0, right:0, height:'1.5px' }} />
                    <div className="cut-line" style={{ left: frame.x,         top:0, bottom:0, width:'1.5px' }} />
                    <div className="cut-line" style={{ left: frame.x+frame.w, top:0, bottom:0, width:'1.5px' }} />
                  </>}

                  {/* Draggable crop frame */}
                  {frame.w > 0 && (
                    <div ref={frameRef} className="crop-frame"
                      style={{ left:frame.x, top:frame.y, width:frame.w, height:frame.h }}
                      onMouseDown={onMouseDown}
                      onTouchStart={e => { e.preventDefault(); onMouseDown(e.touches[0]); }}>
                      <div className="cf-border" />
                      <div className="cf-thirds">
                        {[...Array(9)].map((_,i) => <span key={i} />)}
                      </div>
                      <div className="cf-corner cf-tl" /><div className="cf-corner cf-tr" />
                      <div className="cf-corner cf-bl" /><div className="cf-corner cf-br" />
                      <div className="cf-badge">{preset ? `${preset.w}" × ${preset.h}"` : '—'}</div>
                      <div className="cf-edge-w">{cropPxW} px</div>
                      <div className="cf-edge-h">{cropPxH} px</div>
                    </div>
                  )}
                </div>

                <div className="info-bar">
                  <div className="info-item">ORIGINAL<span className="v2">{activeFile.nw} × {activeFile.nh} px</span></div>
                  <div className="info-item">SIZE<span className="v1">{preset ? `${preset.w}" × ${preset.h}"` : '—'}</span></div>
                  <div className="info-item">OUTPUT<span className="v3">{preset ? `${preset.w*dpi} × ${preset.h*dpi} px @ ${dpi}dpi` : '—'}</span></div>
                  <div className="info-item">POSITION<span className="v3">x:{Math.round(frame.x)} y:{Math.round(frame.y)}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
>>>>>>> 5421cf09b210f0223df7bfcf6f1af66e9ebf9ff5
      </div>
    </div>
  );
}
