import React, { useEffect, useState } from 'react';
import { getOutreach, discoverWebsites, generateEmail, saveOutreach, createDraft, updateOutreach, deleteOutreach } from '../api';
import { Search, Mail, Plus, Trash2, Send, Check, RefreshCw, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const NICHES = ['edtech', 'coding', 'career', 'technology', 'startup'];

export default function OutreachManager() {
  const [outreach, setOutreach] = useState([]);
  const [discovered, setDiscovered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [niche, setNiche] = useState('edtech');
  const [generatingEmail, setGeneratingEmail] = useState(null);
  const [draftingId, setDraftingId] = useState(null);
  const [tab, setTab] = useState('campaigns');

  const fetchOutreach = async () => {
    setLoading(true);
    try {
      const res = await getOutreach();
      setOutreach(res.data);
    } catch { toast.error('Failed to load outreach'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOutreach(); }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    setDiscovered([]);
    try {
      const res = await discoverWebsites({ niche });
      setDiscovered(res.data.websites || []);
      setTab('discover');
      toast.success(`Found ${res.data.websites?.length || 0} websites!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Discovery failed');
    } finally { setDiscovering(false); }
  };

  const handleGenerateEmail = async (site) => {
    setGeneratingEmail(site.websiteUrl);
    try {
      const res = await generateEmail({ websiteName: site.websiteName, websiteUrl: site.websiteUrl, niche });
      // Save to campaigns
      const saved = await saveOutreach({
        ...site,
        emailSubject: res.data.subject,
        emailBody: res.data.body,
        status: 'draft'
      });
      setOutreach(prev => [saved.data, ...prev]);
      toast.success('Email generated & saved to campaigns!');
      setTab('campaigns');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email generation failed');
    } finally { setGeneratingEmail(null); }
  };

  const handleCreateDraft = async (id) => {
    setDraftingId(id);
    try {
      await createDraft(id);
      toast.success('Gmail draft created! Check your Drafts folder.');
      await updateOutreach(id, { status: 'draft' });
      fetchOutreach();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Draft creation failed - ensure Gmail is connected in Settings');
    } finally { setDraftingId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this outreach?')) return;
    try {
      await deleteOutreach(id);
      setOutreach(prev => prev.filter(o => o._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Outreach Manager</h1>
        <p className="page-subtitle">Find websites, generate emails, create Gmail drafts for link building</p>
      </div>

      {/* Discover Panel */}
      <div className="card" style={{ marginBottom:20 }}>
        <h3 className="card-title">Discover Websites</h3>
        <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
          <div className="form-group" style={{ marginBottom:0, flex:1, minWidth:200 }}>
            <label className="form-label">Niche</label>
            <select className="form-select" value={niche} onChange={e => setNiche(e.target.value)}>
              {NICHES.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleDiscover} disabled={discovering} style={{ marginBottom:0 }}>
            {discovering ? <><RefreshCw size={14} style={{ animation:'spin 0.8s linear infinite' }}/> Discovering...</> : <><Search size={14}/> Find Websites</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab==='campaigns'?'active':''}`} onClick={() => setTab('campaigns')}>
          Campaigns ({outreach.length})
        </button>
        <button className={`tab ${tab==='discover'?'active':''}`} onClick={() => setTab('discover')}>
          Discovered ({discovered.length})
        </button>
      </div>

      {/* Campaigns Tab */}
      {tab === 'campaigns' && (
        loading ? <div className="loading-wrap"><div className="spinner"/></div> :
        !outreach.length ? (
          <div className="card"><div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No outreach campaigns yet</h3>
            <p>Discover websites and generate outreach emails above</p>
          </div></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {outreach.map(o => (
              <div key={o._id} className="card">
                <div className="flex-between" style={{ marginBottom:12, alignItems:'flex-start' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <Globe size={14} color="var(--cyan)"/>
                      <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{o.websiteName}</span>
                      <span className={`badge badge-${o.status}`}>{o.status}</span>
                    </div>
                    <a href={o.websiteUrl} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'var(--text-muted)', textDecoration:'none' }}>{o.websiteUrl}</a>
                    {o.contactEmail && <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>📧 {o.contactEmail}</div>}
                  </div>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(o._id)}><Trash2 size={12}/></button>
                </div>

                {o.emailSubject && (
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'12px 14px', marginBottom:12 }}>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>Subject: <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{o.emailSubject}</span></div>
                    <pre style={{ fontSize:12, color:'var(--text-secondary)', whiteSpace:'pre-wrap', margin:0, fontFamily:'Inter, sans-serif', lineHeight:1.6 }}>{o.emailBody}</pre>
                  </div>
                )}

                <div className="btn-group">
                  {o.contactEmail && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleCreateDraft(o._id)} disabled={draftingId === o._id}>
                      {draftingId === o._id ? <><RefreshCw size={12} style={{ animation:'spin 0.8s linear infinite' }}/> Creating...</> : <><Mail size={12}/> Create Gmail Draft</>}
                    </button>
                  )}
                  {o.gmailDraftId && <span style={{ fontSize:11, color:'var(--green)', display:'flex', alignItems:'center', gap:3 }}><Check size={11}/> Draft created</span>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Discover Tab */}
      {tab === 'discover' && (
        !discovered.length ? (
          <div className="card"><div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No websites discovered yet</h3>
            <p>Select a niche and click "Find Websites"</p>
          </div></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {discovered.map((site, i) => (
              <div key={i} className="card">
                <div className="flex-between" style={{ alignItems:'flex-start' }}>
                  <div style={{ flex:1, marginRight:12 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{site.websiteName}</div>
                    <a href={site.websiteUrl} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'var(--cyan)', marginBottom:6, display:'block' }}>{site.websiteUrl}</a>
                    {site.contactEmail && <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Contact: {site.contactEmail}</div>}
                    {site.notes && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{site.notes}</div>}
                  </div>
                  <button
                    className="btn btn-purple btn-sm"
                    onClick={() => handleGenerateEmail(site)}
                    disabled={generatingEmail === site.websiteUrl}
                  >
                    {generatingEmail === site.websiteUrl
                      ? <><RefreshCw size={12} style={{ animation:'spin 0.8s linear infinite' }}/> Generating...</>
                      : <><Send size={12}/> Generate Email</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
