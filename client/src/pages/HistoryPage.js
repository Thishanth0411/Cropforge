import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage() {
  const { user, logout } = useAuth();
  const [crops,   setCrops]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/crops')
      .then(({ data }) => setCrops(data.crops))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const deleteCrop = async (id) => {
    try {
      await axios.delete(`/api/crops/${id}`);
      setCrops(prev => prev.filter(c => c._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <div className="app-header">
        <div className="header-logo">Crop<span>Forge</span></div>
        <div className="header-nav">
          <Link to="/"        className="nav-btn">Editor</Link>
          <Link to="/history" className="nav-btn active">History</Link>
          <span className="user-badge">👤 {user?.name}</span>
          <button className="nav-btn" onClick={logout}>Sign Out</button>
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'32px 40px' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, marginBottom:24 }}>
          Crop History
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--muted)', fontWeight:400, marginLeft:12 }}>
            {crops.length} crops
          </span>
        </div>

        {loading ? (
          <div style={{ color:'var(--muted)', fontFamily:'DM Mono,monospace', fontSize:12 }}>Loading…</div>
        ) : crops.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
            <div style={{ fontSize:40, opacity:0.15, marginBottom:14 }}>📂</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, opacity:0.3 }}>No crops yet</div>
            <div style={{ fontSize:13, marginTop:8 }}>
              Head to the <Link to="/" style={{ color:'var(--accent)' }}>Editor</Link> to crop your first image.
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16 }}>
            {crops.map(crop => (
              <div key={crop._id} style={{
                background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:12, overflow:'hidden',
                transition:'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
              >
                {/* Thumbnail placeholder */}
                <div style={{ width:'100%', height:130, background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:'DM Mono,monospace', fontSize:18, color:'var(--accent)', fontWeight:500 }}>
                    {crop.sizeLabel?.replace('x','\u00d7') || '—'}
                  </span>
                </div>
                <div style={{ padding:12 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:800, color:'var(--accent)', marginBottom:4 }}>
                    {crop.sizeLabel ? `${crop.sizeLabel.replace('x', '" × ')}"` : 'Custom'}
                  </div>
                  <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--muted)', lineHeight:1.6 }}>
                    {crop.outputWidth} × {crop.outputHeight} px<br />
                    {crop.format?.toUpperCase()} · {crop.dpi} DPI · Q{crop.quality}<br />
                    {new Date(crop.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ display:'flex', gap:6, marginTop:10 }}>
                    <a href={`/api/crops/download/${crop._id}`}
                      style={{ flex:1, padding:'7px 0', background:'var(--accent)', color:'#0d0d0f', border:'none', borderRadius:7, fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, cursor:'pointer', textAlign:'center', textDecoration:'none', display:'block' }}>
                      ↓ Download
                    </a>
                    <button onClick={() => deleteCrop(crop._id)}
                      style={{ padding:'7px 10px', background:'transparent', color:'var(--danger)', border:'1px solid var(--border)', borderRadius:7, cursor:'pointer', fontSize:11 }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
