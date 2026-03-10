import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PRESETS = [
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
];

export default function EditorPage() {
  const { user, logout } = useAuth();

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
          <Link to="/"        className="nav-btn active">Editor</Link>
          <Link to="/history" className="nav-btn">History</Link>
          <span className="user-badge">👤 {user?.name}</span>
          <button className="nav-btn" onClick={logout}>Sign Out</button>
        </div>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="sec-label">Crop Size — click to apply</div>
            <div className="preset-grid">
              {PRESETS.map(p => (
                <button key={p.label} className={`preset-btn${preset?.label === p.label ? ' selected' : ''}`}
                  onClick={() => setPreset(p)}>
                  <span className="preset-name">{p.label}</span>
                  <span className="preset-ratio">{p.w}:{p.h}</span>
                </button>
              ))}
            </div>
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
              </div>
            </div>
          </div>

          <div>
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
      </div>
    </div>
  );
}
