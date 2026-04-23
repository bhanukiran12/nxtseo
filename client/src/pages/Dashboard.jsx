import React, { useEffect, useState } from 'react';
import { getDashboard } from '../api';
import { FileText, Link2, Mail, TrendingUp, Clock, CheckCircle, Globe } from 'lucide-react';

const PLATFORM_COLORS = {
  medium: '#ccc', linkedin: '#60a5fa', devto: '#e2e8f0', hashnode: '#818cf8', none: '#4a5568', pending: '#f97316'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  const s = data?.stats || {};

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">SEO automation overview for <span className="text-cyan">ccbp.in/intensive</span></p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard color="cyan" icon={<FileText size={20}/>} value={s.totalBlogs || 0} label="Blogs Created" sub={`${s.draftBlogs || 0} draft · ${s.publishedBlogs || 0} published`} />
        <StatCard color="purple" icon={<Link2 size={20}/>} value={s.totalBacklinks || 0} label="Backlinks Generated" sub={`${s.publishedBacklinks || 0} live`} />
        <StatCard color="green" icon={<Mail size={20}/>} value={s.totalOutreach || 0} label="Outreach Campaigns" sub={`${s.sentOutreach || 0} sent`} />
        <StatCard color="orange" icon={<TrendingUp size={20}/>} value={s.publishedBlogs || 0} label="Published Posts" sub="across platforms" />
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        {/* Recent Blogs */}
        <div className="card">
          <div className="flex-between mb-16">
            <h3 className="card-title mb-0">Recent Blogs</h3>
            <a href="/blogs" style={{ fontSize:12, color:'var(--cyan)', textDecoration:'none' }}>View all →</a>
          </div>
          {(!data?.recentBlogs?.length) ? (
            <div className="empty-state" style={{ padding:'20px 0' }}>
              <p>No blogs yet. <a href="/generate" className="text-cyan">Generate your first blog →</a></p>
            </div>
          ) : data.recentBlogs.map(b => (
            <div key={b._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <div style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500, marginBottom:3 }}>{b.title}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`badge badge-${b.status}`}>{b.status}</span>
            </div>
          ))}
        </div>

        {/* Platform breakdown */}
        <div className="card">
          <h3 className="card-title">Platform Distribution</h3>
          {(!data?.platformStats?.length) ? (
            <div className="empty-state" style={{ padding:'20px 0' }}>
              <p>Publish blogs to see platform data</p>
            </div>
          ) : data.platformStats.map(p => (
            <div key={p._id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: PLATFORM_COLORS[p._id] || '#888', flexShrink:0 }} />
              <span style={{ fontSize:13, color:'var(--text-secondary)', textTransform:'capitalize', flex:1 }}>{p._id || 'Unpublished'}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{p.count}</span>
            </div>
          ))}

          <div className="divider" />
          <div className="flex-between">
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Target URL</span>
            <a href="https://www.ccbp.in/intensive" target="_blank" rel="noreferrer" style={{ fontSize:12, color:'var(--cyan)', display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>
              ccbp.in/intensive <Globe size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* Backlink Status */}
      <div className="card">
        <div className="flex-between mb-16">
          <h3 className="card-title mb-0">Backlink Status</h3>
          <a href="/backlinks" style={{ fontSize:12, color:'var(--cyan)', textDecoration:'none' }}>Manage →</a>
        </div>
        <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
          {['sent','submitted','published'].map(st => {
            const count = data?.backlinkStatusStats?.find(b => b._id === st)?.count || 0;
            return (
              <div key={st} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className={`badge badge-${st}`}>{st}</span>
                <span style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ color, icon, value, label, sub }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
