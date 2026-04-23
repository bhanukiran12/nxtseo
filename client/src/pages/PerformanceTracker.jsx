import React, { useEffect, useState } from 'react';
import { getGSCPerformance, getAuthStatus, getAuthUrl } from '../api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, MousePointerClick, Eye, Target, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#0d1225', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'var(--text-muted)', marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin:'2px 0' }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function PerformanceTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [days, setDays] = useState(28);

  const checkAuth = async () => {
    const res = await getAuthStatus();
    setConnected(res.data.connected);
    return res.data.connected;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const isConn = await checkAuth();
      if (!isConn) { setLoading(false); return; }
      const res = await getGSCPerformance({ days });
      setData(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load GSC data';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [days]);

  const handleConnect = async () => {
    try {
      const res = await getAuthUrl();
      window.location.href = res.data.authUrl;
    } catch { toast.error('Failed to get auth URL'); }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner"/><span>Loading GSC data...</span></div>;

  if (!connected) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Performance Tracker</h1>
          <p className="page-subtitle">Google Search Console data for ccbp.in/intensive</p>
        </div>
        <div className="card" style={{ maxWidth:480, textAlign:'center', padding:'48px 32px' }}>
          <div style={{ width:64, height:64, background:'linear-gradient(135deg, #00d4ff, #a855f7)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <TrendingUp size={28} color="#080c18"/>
          </div>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Connect Google Search Console</h2>
          <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:24 }}>
            Connect your Google account to view clicks, impressions, and keyword rankings for ccbp.in/intensive.
          </p>
          <button className="btn btn-primary" onClick={handleConnect} style={{ margin:'0 auto' }}>
            Connect Google Account
          </button>
        </div>
      </div>
    );
  }

  const s = data?.summary || {};

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Performance Tracker</h1>
          <p className="page-subtitle">Google Search Console — <span className="text-cyan">ccbp.in/intensive</span></p>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <select className="form-select" value={days} onChange={e => setDays(Number(e.target.value))} style={{ width:'auto' }}>
            <option value={7}>Last 7 days</option>
            <option value={28}>Last 28 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="btn btn-secondary" onClick={fetchData}><RefreshCw size={14}/></button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card cyan">
          <div className="stat-icon"><MousePointerClick size={20}/></div>
          <div className="stat-value">{s.totalClicks?.toLocaleString() || 0}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><Eye size={20}/></div>
          <div className="stat-value">{s.totalImpressions?.toLocaleString() || 0}</div>
          <div className="stat-label">Impressions</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><TrendingUp size={20}/></div>
          <div className="stat-value">{s.avgCTR || 0}%</div>
          <div className="stat-label">Avg CTR</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><Target size={20}/></div>
          <div className="stat-value">#{s.avgPosition || 0}</div>
          <div className="stat-label">Avg Position</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        {/* Clicks over time */}
        <div className="card">
          <h3 className="card-title">Clicks Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.dateData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#4a5568' }} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#4a5568' }} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="clicks" stroke="#00d4ff" strokeWidth={2} dot={false} name="Clicks"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Impressions over time */}
        <div className="card">
          <h3 className="card-title">Impressions Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.dateData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#4a5568' }} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#4a5568' }} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="impressions" stroke="#a855f7" strokeWidth={2} dot={false} name="Impressions"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Top Keywords</h3>
          {!data?.keywords?.length ? (
            <div className="empty-state" style={{ padding:'20px 0' }}><p>No keyword data available</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Keyword</th><th>Clicks</th><th>Impressions</th><th>Position</th></tr></thead>
                <tbody>
                  {data.keywords.map((k, i) => (
                    <tr key={i}>
                      <td style={{ maxWidth:200 }}><span style={{ color:'var(--text-primary)', fontSize:12 }}>{k.keyword}</span></td>
                      <td style={{ color:'var(--cyan)', fontWeight:600 }}>{k.clicks}</td>
                      <td>{k.impressions}</td>
                      <td><span style={{ color: Number(k.position) < 10 ? 'var(--green)' : 'var(--orange)', fontWeight:600 }}>#{k.position}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Pages */}
        <div className="card">
          <h3 className="card-title">Top Pages</h3>
          {!data?.topPages?.length ? (
            <div className="empty-state" style={{ padding:'20px 0' }}><p>No page data available</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.topPages.slice(0,6)} layout="vertical">
                  <XAxis type="number" tick={{ fontSize:10, fill:'#4a5568' }} tickLine={false} axisLine={false}/>
                  <YAxis type="category" dataKey="page" tick={{ fontSize:9, fill:'#4a5568' }} width={120} tickLine={false}
                    tickFormatter={v => v.replace('https://www.ccbp.in','').slice(0,20)}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="clicks" fill="#00d4ff" radius={[0,4,4,0]} name="Clicks"/>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
