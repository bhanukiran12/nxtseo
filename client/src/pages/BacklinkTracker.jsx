import React, { useEffect, useState } from 'react';
import { verifyBacklink, getBacklinks, addBacklink, updateBacklink, deleteBacklink } from '../api';
import { Plus, Trash2, ExternalLink, Check, ShieldCheck, AlertOctagon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['sent', 'submitted', 'published'];
const PLATFORMS = ['Medium', 'LinkedIn', 'Dev.to', 'Hashnode', 'Guest Post', 'Forum', 'Other'];

export default function BacklinkTracker() {
  const [backlinks, setBacklinks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({ platform: 'Medium', blogUrl: '', blogTitle: '', anchorText: '', status: 'sent', notes: '' });

  const fetchBacklinks = async () => {
    setLoading(true);
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await getBacklinks(params);
      setBacklinks(res.data.backlinks);
      setStats(res.data.stats);
    } catch { toast.error('Failed to load backlinks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBacklinks(); }, [filterStatus]);

  const handleAdd = async () => {
    if (!form.platform || !form.anchorText) return toast.error('Platform and anchor text are required');
    try {
      await addBacklink(form);
      toast.success('Backlink added!');
      setShowAdd(false);
      setForm({ platform: 'Medium', blogUrl: '', blogTitle: '', anchorText: '', status: 'sent', notes: '' });
      fetchBacklinks();
    } catch { toast.error('Failed to add backlink'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateBacklink(id, { status });
      setBacklinks(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const handleVerify = async (id) => {
    setVerifying(id);
    try {
      const res = await verifyBacklink(id);
      if (res.data.isLive) {
        toast.success('Backlink is LIVE and verified!');
      } else {
        toast.error('Backlink not found on the page');
      }
      fetchBacklinks();
    } catch { toast.error('Verification failed'); }
    finally { setVerifying(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this backlink?')) return;
    try {
      await deleteBacklink(id);
      toast.success('Deleted');
      fetchBacklinks();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Backlink Tracker</h1>
          <p className="page-subtitle">Monitoring link integrity for <span className="text-cyan">ccbp.in/intensive</span></p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14}/> Add Backlink
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(5, 1fr)', marginBottom:20 }}>
        {[
          { label:'Total', value: stats.total || 0, color:'cyan' },
          { label:'Sent', value: stats.sent || 0, color:'orange' },
          { label:'Submitted', value: stats.submitted || 0, color:'purple' },
          { label:'Published', value: stats.published || 0, color:'green' },
          { label:'Live', value: stats.live || 0, color:'cyan' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`} style={{ padding:'16px 20px' }}>
            <div className="stat-value" style={{ fontSize:26 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginBottom:20 }}>
          <h3 className="card-title">Add New Backlink</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Platform</label>
              <select className="form-select" value={form.platform} onChange={e => setForm({...form, platform:e.target.value})}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blog Title</label>
              <input className="form-input" value={form.blogTitle} onChange={e => setForm({...form, blogTitle:e.target.value})} placeholder="Title of the page with backlink" />
            </div>
            <div className="form-group">
              <label className="form-label">Blog / Page URL</label>
              <input className="form-input" value={form.blogUrl} onChange={e => setForm({...form, blogUrl:e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Anchor Text Used *</label>
            <input className="form-input" value={form.anchorText} onChange={e => setForm({...form, anchorText:e.target.value})} placeholder="e.g. NxtWave's CCBP Intensive" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <input className="form-input" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} placeholder="Optional notes" />
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleAdd}><Check size={14}/> Save Backlink</button>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="tabs" style={{ marginBottom:16 }}>
        {['all', 'sent', 'submitted', 'published'].map(s => (
          <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner"/></div>
      ) : !backlinks.length ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">🔗</div>
          <h3>No backlinks tracked yet</h3>
          <p>Add backlinks manually or generate blogs to track them automatically</p>
        </div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Blog / Page</th>
                  <th>Verification</th>
                  <th>Anchor Text</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backlinks.map(bl => (
                  <tr key={bl._id}>
                    <td><span className={`badge badge-${bl.platform?.toLowerCase()}`}>{bl.platform}</span></td>
                    <td>
                      <div style={{ maxWidth:200 }}>
                        <div style={{ fontSize:12, color:'var(--text-primary)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bl.blogTitle || '—'}</div>
                        {bl.blogUrl && <a href={bl.blogUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'var(--cyan)', display:'flex', alignItems:'center', gap:3, textDecoration:'none' }}><ExternalLink size={10}/> View Page</a>}
                      </div>
                    </td>
                    <td>
                      {bl.verified ? (
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          {bl.isLive ? (
                            <div className="flex-center gap-4" style={{ color: 'var(--green)', fontSize: 11, fontWeight: 600 }}>
                              <ShieldCheck size={14} /> LIVE
                            </div>
                          ) : (
                            <div className="flex-center gap-4" style={{ color: 'var(--red)', fontSize: 11, fontWeight: 600 }}>
                              <AlertOctagon size={14} /> MISSING
                            </div>
                          )}
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{new Date(bl.lastChecked).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize:11, color: 'var(--text-muted)' }}>Not verified</span>
                      )}
                    </td>
                    <td><span style={{ color:'var(--cyan)', fontSize:12, fontWeight:500 }}>"{bl.anchorText}"</span></td>
                    <td>
                      <select
                        value={bl.status}
                        onChange={e => handleStatusChange(bl._id, e.target.value)}
                        style={{ background:'transparent', border:'none', color: bl.status === 'published' ? 'var(--green)' : bl.status === 'submitted' ? 'var(--purple)' : 'var(--orange)', fontSize:12, fontWeight:600, cursor:'pointer', outline:'none' }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="flex gap-8">
                        <button 
                          className="btn btn-secondary btn-sm btn-icon" 
                          title="Verify Status"
                          disabled={verifying === bl._id || !bl.blogUrl}
                          onClick={() => handleVerify(bl._id)}
                        >
                          <RefreshCw size={12} className={verifying === bl._id ? 'spinner' : ''} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(bl._id)}><Trash2 size={12}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
