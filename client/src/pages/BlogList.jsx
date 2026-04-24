import React, { useEffect, useState } from 'react';
import { getBlogs, deleteBlog } from '../api';
import { Trash2, ExternalLink, Eye, PenLine } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PLATFORMS = ['all', 'none', 'medium', 'linkedin', 'devto', 'hashnode'];
const STATUSES = ['all', 'draft', 'exported', 'published'];

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('all');
  const [status, setStatus] = useState('all');
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (platform !== 'all') params.platform = platform;
      if (status !== 'all') params.status = status;
      const res = await getBlogs(params);
      setBlogs(res.data.blogs);
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [platform, status]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this blog?')) return;
    try {
      await deleteBlog(id);
      toast.success('Blog deleted');
      fetchBlogs();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">My Blogs</h1>
          <p className="page-subtitle">{blogs.length} blogs generated for ccbp.in/intensive</p>
        </div>
        <Link to="/generate" className="btn btn-primary"><PenLine size={14}/> New Blog</Link>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div>
          <label className="form-label" style={{ marginBottom:4 }}>Platform</label>
          <select className="form-select" value={platform} onChange={e => setPlatform(e.target.value)} style={{ width:'auto', minWidth:130 }}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label" style={{ marginBottom:4 }}>Status</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)} style={{ width:'auto', minWidth:130 }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner"/><span>Loading blogs...</span></div>
      ) : !blogs.length ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No blogs yet</h3>
            <p><Link to="/generate" className="text-cyan">Generate your first SEO blog →</Link></p>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {blogs.map(blog => (
            <div key={blog._id} className="card" style={{ cursor:'pointer', transition:'all 0.15s' }}
              onClick={() => navigate(`/blogs/${blog._id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
            >
              <div className="flex-between" style={{ alignItems:'flex-start' }}>
                <div style={{ flex:1, marginRight:16 }}>
                  <div style={{ marginBottom:8 }}>
                    <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', marginBottom:4, lineHeight:1.4 }}>{blog.title}</h3>
                    {blog.summary && <p style={{ fontSize:13, color:'var(--text-secondary)' }}>{blog.summary}</p>}
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                    <span className={`badge badge-${blog.status}`}>{blog.status}</span>
                    {blog.platform && blog.platform !== 'none' && <span className={`badge badge-${blog.platform}`}>{blog.platform}</span>}
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{blog.backlinks?.length || 0} backlinks</span>
                    {blog.wordCount && <span style={{ fontSize:11, color:'var(--text-muted)' }}>~{blog.wordCount} words</span>}
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{new Date(blog.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {blog.publishedUrl && (
                    <a href={blog.publishedUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm btn-icon"
                      onClick={e => e.stopPropagation()} title="View published">
                      <ExternalLink size={13}/>
                    </a>
                  )}
                  <button className="btn btn-secondary btn-sm btn-icon" title="Edit blog">
                    <Eye size={13}/>
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" title="Delete"
                    onClick={(e) => handleDelete(blog._id, e)}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
