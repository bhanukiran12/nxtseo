import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlog, updateBlog, publishBlog } from '../api';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { Copy, Check, Download, Send, Eye, Code, ArrowLeft, ExternalLink } from 'lucide-react';

const PLATFORMS = [
  { id: 'medium',   label: 'Medium',   color: '#ccc',    needsKey: false },
  { id: 'linkedin', label: 'LinkedIn', color: '#60a5fa', needsKey: false },
  { id: 'devto',    label: 'Dev.to',   color: '#e2e8f0', needsKey: true  },
  { id: 'hashnode', label: 'Hashnode', color: '#818cf8', needsKey: true  },
];

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [platform, setPlatform] = useState('medium');
  const [apiKey, setApiKey] = useState('');
  const [pubId, setPubId] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getBlog(id)
      .then(r => {
        setBlog(r.data);
        setContent(r.data.content);
      })
      .catch(() => toast.error('Blog not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateBlog(id, { content });
      setBlog(res.data);
      setEditing(false);
      toast.success('Saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishBlog(id, { platform, apiKey, publicationId: pubId });
      toast.success(`Published to ${platform}!`);
      const res = await getBlog(id);
      setBlog(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Publish failed');
    } finally { setPublishing(false); }
  };

  const copyFormatted = (key) => {
    const text = blog.formattedVersions?.[key] || blog.content;
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success(`Copied ${key} format!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMd = () => {
    const blob = new Blob([blog.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${blog.title.slice(0,40).replace(/\s/g,'-')}.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  if (loading) return <div className="loading-wrap"><div className="spinner"/><span>Loading blog...</span></div>;
  if (!blog) return <div className="empty-state"><h3>Blog not found</h3></div>;

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/blogs')} style={{ marginBottom:8 }}>
            <ArrowLeft size={13}/> Back
          </button>
          <h1 className="page-title" style={{ fontSize:20 }}>{blog.title}</h1>
          <div style={{ display:'flex', gap:8, marginTop:6 }}>
            <span className={`badge badge-${blog.status}`}>{blog.status}</span>
            {blog.platform !== 'none' && <span className={`badge badge-${blog.platform}`}>{blog.platform}</span>}
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>{blog.backlinks?.length || 0} backlinks · ~{blog.wordCount} words</span>
          </div>
        </div>
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={downloadMd}><Download size={14}/> Export .md</button>
          {editing ? (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><Check size={14}/> Save</>}
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}><Code size={14}/> Edit</button>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems:'start', gap:20 }}>
        {/* Content Editor */}
        <div className="card">
          <div className="tabs">
            <button className={`tab ${!preview?'active':''}`} onClick={() => setPreview(false)}>
              {editing ? 'Edit' : 'Markdown'}
            </button>
            <button className={`tab ${preview?'active':''}`} onClick={() => setPreview(true)}>
              <Eye size={13}/> Preview
            </button>
          </div>

          {preview ? (
            <div className="md-content" style={{ maxHeight:600, overflowY:'auto' }}>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : editing ? (
            <textarea className="form-textarea blog-editor" value={content} onChange={e => setContent(e.target.value)} style={{ minHeight:500 }}/>
          ) : (
            <pre style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-secondary)', whiteSpace:'pre-wrap', lineHeight:1.7, maxHeight:500, overflowY:'auto' }}>{content}</pre>
          )}

          {/* Embedded backlinks */}
          {blog.backlinks?.length > 0 && (
            <div style={{ marginTop:16, background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:8, padding:'12px 14px' }}>
              <div style={{ fontSize:11, color:'var(--cyan)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8, fontWeight:600 }}>Embedded Backlinks to ccbp.in/intensive</div>
              {blog.backlinks.map((bl, i) => (
                <div key={i} style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:3 }}>
                  {i+1}. <span style={{ color:'var(--cyan)' }}>"{bl.anchorText}"</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publish Panel */}
        <div>
          {/* Platform Publisher */}
          <div className="card" style={{ marginBottom:16 }}>
            <h3 className="card-title">Publish / Export</h3>

            <div className="form-group">
              <label className="form-label">Platform</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {PLATFORMS.map(p => (
                  <button key={p.id}
                    className={`btn btn-sm ${platform === p.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ color: platform === p.id ? '#080c18' : p.color }}
                    onClick={() => setPlatform(p.id)}
                  >{p.label}</button>
                ))}
              </div>
            </div>

            {selectedPlatform?.needsKey && (
              <>
                <div className="form-group">
                  <label className="form-label">{platform === 'devto' ? 'Dev.to API Key' : 'Hashnode API Key'}</label>
                  <input className="form-input" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter API key" />
                </div>
                {platform === 'hashnode' && (
                  <div className="form-group">
                    <label className="form-label">Publication ID</label>
                    <input className="form-input" value={pubId} onChange={e => setPubId(e.target.value)} placeholder="Your Hashnode publication ID" />
                  </div>
                )}
                <button className="btn btn-primary w-full" onClick={handlePublish} disabled={publishing}>
                  {publishing ? 'Publishing...' : <><Send size={14}/> Publish to {selectedPlatform.label}</>}
                </button>
              </>
            )}

            {!selectedPlatform?.needsKey && (
              <>
                <div className="alert alert-info" style={{ marginBottom:12 }}>
                  {platform === 'medium' || platform === 'linkedin' ? 'Copy the formatted version below and paste into the platform editor.' : ''}
                </div>
                <div className="btn-group">
                  <button className="btn btn-secondary" onClick={() => copyFormatted(platform)}>
                    {copied === platform ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy {selectedPlatform.label} Format</>}
                  </button>
                  <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
                    {publishing ? 'Saving...' : 'Mark as Exported'}
                  </button>
                </div>
              </>
            )}

            {blog.publishedUrl && (
              <div style={{ marginTop:12 }}>
                <a href={blog.publishedUrl} target="_blank" rel="noreferrer" className="btn btn-secondary w-full">
                  <ExternalLink size={13}/> View Published Post
                </a>
              </div>
            )}
          </div>

          {/* Formatted preview */}
          <div className="card">
            <h3 className="card-title">Formatted for {selectedPlatform?.label}</h3>
            <pre style={{ fontFamily:'monospace', fontSize:11, color:'var(--text-secondary)', whiteSpace:'pre-wrap', maxHeight:250, overflowY:'auto', lineHeight:1.6 }}>
              {blog.formattedVersions?.[platform] || 'No formatted version available'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
