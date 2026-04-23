import React, { useEffect, useState } from 'react';
import { getDashboard, getHealth } from '../api';
import { FileText, Link2, Mail, TrendingUp, Clock, CheckCircle, Globe, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

const PLATFORM_COLORS = {
  medium: '#ccc', linkedin: '#60a5fa', devto: '#e2e8f0', hashnode: '#818cf8', none: '#4a5568', pending: '#f97316'
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getHealth()])
      .then(([dashRes, healthRes]) => {
        setData(dashRes.data);
        setHealth(healthRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span>Initializing AI SEO Engine...</span>
    </div>
  );

  const s = data?.stats || {};

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">NxtSEO Intelligence Hub</p>
        </div>
        
        {/* System Health Mini-Widget */}
        <div className="flex gap-12">
          {health?.services && Object.entries(health.services).map(([name, status]) => (
            <div key={name} className="flex-center gap-8 card" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'online' || status === 'configured' ? 'var(--green)' : 'var(--red)' }} />
              <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard color="cyan" icon={<FileText size={20}/>} value={s.totalBlogs || 0} label="Blogs Generated" sub={`${s.publishedBlogs || 0} live posts`} />
        <StatCard color="purple" icon={<Link2 size={20}/>} value={s.totalBacklinks || 0} label="Backlinks" sub={`${s.live || 0} verified live`} />
        <StatCard color="green" icon={<Mail size={20}/>} value={s.totalOutreach || 0} label="Prospects" sub={`${s.sentOutreach || 0} emails sent`} />
        <StatCard color="orange" icon={<ShieldCheck size={20}/>} value={s.totalBacklinks > 0 ? `${Math.round((s.live / s.totalBacklinks) * 100)}%` : '0%'} label="Link Integrity" sub="Backlink health score" />
      </div>

      <div className="grid-3" style={{ marginBottom:24 }}>
        {/* Recent Blogs */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex-between mb-16">
            <h3 className="card-title mb-0">Recent Activity</h3>
            <a href="/blogs" style={{ fontSize:12, color:'var(--cyan)', textDecoration:'none' }}>View all →</a>
          </div>
          {(!data?.recentBlogs?.length) ? (
            <div className="empty-state" style={{ padding:'20px 0' }}>
              <p>No activity yet. <a href="/generate" className="text-cyan">Generate your first blog →</a></p>
            </div>
          ) : data.recentBlogs.map(b => (
            <div key={b._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:6, background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <FileText size={14} className="text-secondary" />
                </div>
                <div>
                  <div style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500, marginBottom:2 }}>{b.title}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <span className={`badge badge-${b.status}`}>{b.status}</span>
            </div>
          ))}
        </div>

        {/* Target Control Center */}
        <div className="card">
          <h3 className="card-title">Target Overview</h3>
          <div style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid var(--cyan-dim)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Primary Destination</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, wordBreak: 'break-all' }}>ccbp.in/intensive</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>NxtWave's CCBP Intensive Program</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="card" style={{ padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cyan)' }}>{s.live || 0}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Backlinks</div>
            </div>
            <div className="card" style={{ padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--purple)' }}>{data?.platformStats?.length || 0}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Platforms</div>
            </div>
          </div>

          <div className="divider" />
          <a href="https://www.ccbp.in/intensive" target="_blank" rel="noreferrer" className="btn btn-secondary w-full flex-center gap-8" style={{ textDecoration: 'none' }}>
            <Globe size={14} /> View Live Program
          </a>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="card">
        <h3 className="card-title">SEO Distribution Score</h3>
        <div className="flex gap-24 flex-wrap" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            {(!data?.platformStats?.length) ? (
              <div className="empty-state" style={{ padding:'20px 0' }}>
                <p>No platform data available</p>
              </div>
            ) : data.platformStats.map(p => (
              <div key={p._id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ width:12, height:12, borderRadius:4, background: PLATFORM_COLORS[p._id] || '#888', flexShrink:0 }} />
                <span style={{ fontSize:13, color:'var(--text-secondary)', textTransform: 'capitalize', flex: 1 }}>{p._id || 'Organic Search'}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{p.count} posts</span>
              </div>
            ))}
          </div>
          
          <div style={{ width:1, height: 100, background: 'var(--border)' }} />

          <div style={{ flex: 1, minWidth: 250 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Activity size={16} className="text-cyan" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Real-time Integration</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              All systems are functional. Gemini AI is currently optimized for <span className="text-cyan">EdTech niche</span> content generation. Verified backlinks are checked every 24 hours.
            </div>
          </div>
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
