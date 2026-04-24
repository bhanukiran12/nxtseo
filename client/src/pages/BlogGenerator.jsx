import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateBlog } from '../api';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const TOPICS = [
  'How to Transition into a Tech Career Without a CS Degree',
  'Full Stack Development Roadmap for Beginners in India',
  'Why Coding Bootcamps Are Better Than Traditional Degrees',
  'Top Skills Every Full Stack Developer Needs in 2025',
  'How to Get Your First Software Job in India',
  'React vs Angular vs Vue: Which Should You Learn First?',
  'Node.js for Beginners: Build Your First REST API',
  'How Online Coding Courses Are Changing Career Paths in India',
  'Python vs JavaScript: Which Language Should You Start With?',
  'Career Growth After a Tech Bootcamp: Real Success Stories',
];

const TONES = ['professional', 'conversational', 'motivational', 'informative'];

export default function BlogGenerator() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState(null);
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error('Please enter a topic');
    setLoading(true);
    setBlog(null);
    try {
      const kws = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const res = await generateBlog({ topic, keywords: kws, tone });
      setBlog(res.data.blog);
      toast.success('Blog generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(blog.content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Blog Generator</h1>
        <p className="page-subtitle">AI-powered SEO blogs with automatic backlinks to <span className="text-cyan">ccbp.in/intensive</span></p>
      </div>

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Config Panel */}
        <div className="card">
          <h3 className="card-title">Generate New Blog</h3>

          <div className="form-group">
            <label className="form-label">Blog Topic *</label>
            <input
              className="form-input"
              placeholder="e.g. How to transition into tech career in India"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>

          {/* Quick topic suggestions */}
          <div className="form-group">
            <label className="form-label">Quick Topics</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {TOPICS.slice(0,5).map(t => (
                <button key={t} className="btn btn-secondary btn-sm" onClick={() => setTopic(t)} style={{ fontSize:11, textAlign:'left', whiteSpace:'normal', height:'auto', lineHeight:1.4, padding:'5px 10px' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Keywords (comma separated)</label>
            <input
              className="form-input"
              placeholder="e.g. coding bootcamp, full stack, tech career India"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tone</label>
            <select className="form-select" value={tone} onChange={e => setTone(e.target.value)}>
              {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>

          <div className="alert alert-info" style={{ marginBottom:16 }}>
            <Sparkles size={14} style={{ flexShrink:0, marginTop:1 }} />
            <span>Every blog automatically includes 2–3 backlinks to <strong>ccbp.in/intensive</strong> with varied anchor text.</span>
          </div>

          <button className="btn btn-primary w-full" onClick={handleGenerate} disabled={loading}>
            {loading ? <><RefreshCw size={15} style={{ animation:'spin 0.8s linear infinite' }} /> Generating...</> : <><Sparkles size={15} /> Generate Blog</>}
          </button>
        </div>

        {/* Output Panel */}
        <div>
          {loading && (
            <div className="card loading-wrap" style={{ minHeight:300 }}>
              <div className="spinner" />
              <div style={{ textAlign:'center' }}>
                <div style={{ color:'var(--text-primary)', fontWeight:600, marginBottom:4 }}>AI is writing your blog...</div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Including backlinks to ccbp.in/intensive</div>
              </div>
            </div>
          )}

          {blog && !loading && (
            <div className="card">
              {/* Meta */}
              <div style={{ marginBottom:16 }}>
                <h2 style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:8, lineHeight:1.3 }}>{blog.title}</h2>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:10 }}>
                  <span className="badge badge-draft">Draft</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>~{blog.wordCount} words</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{blog.readTime} min read</span>
                  <span className="badge badge-published" style={{ background:'rgba(0,212,255,0.1)', color:'var(--cyan)', border:'1px solid rgba(0,212,255,0.2)' }}>
                    {blog.backlinks?.length || 0} backlinks
                  </span>
                </div>
                {blog.summary && <p style={{ fontSize:13, color:'var(--text-secondary)', fontStyle:'italic' }}>{blog.summary}</p>}
              </div>

              {/* Backlinks preview */}
              {blog.backlinks?.length > 0 && (
                <div style={{ background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:8, padding:'12px 14px', marginBottom:16 }}>
                  <div style={{ fontSize:11, color:'var(--cyan)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8, fontWeight:600 }}>Embedded Backlinks</div>
                  {blog.backlinks.map((bl, i) => (
                    <div key={i} style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:4 }}>
                      → <span style={{ color:'var(--cyan)' }}>"{bl.anchorText}"</span> → ccbp.in/intensive
                    </div>
                  ))}
                </div>
              )}

              {/* Toggle */}
              <div className="tabs">
                <button className={`tab ${!preview ? 'active' : ''}`} onClick={() => setPreview(false)}>Markdown</button>
                <button className={`tab ${preview ? 'active' : ''}`} onClick={() => setPreview(true)}>Preview</button>
              </div>

              {/* Content */}
              <div style={{ maxHeight:400, overflowY:'auto', borderRadius:8, background:'rgba(0,0,0,0.2)', padding:16 }}>
                {preview ? (
                  <div className="md-content"><ReactMarkdown>{blog.content}</ReactMarkdown></div>
                ) : (
                  <pre style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-secondary)', whiteSpace:'pre-wrap', lineHeight:1.7 }}>{blog.content}</pre>
                )}
              </div>

              {/* Actions */}
              <div className="btn-group" style={{ marginTop:16 }}>
                <button className="btn btn-secondary" onClick={handleCopy}>
                  {copied ? <><Check size={14}/> Copied!</> : <><Copy size={14}/> Copy Markdown</>}
                </button>
                <Link to={`/blogs/${blog._id}`} className="btn btn-primary">Open Editor →</Link>
              </div>
            </div>
          )}

          {!blog && !loading && (
            <div className="card" style={{ minHeight:300, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div className="empty-state">
                <div className="empty-state-icon">✍️</div>
                <h3>Your blog will appear here</h3>
                <p>Fill in the topic and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
