import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings, getAuthStatus, getAuthUrl, logout } from '../api';
import { Check, Key, Link2, Mail, BarChart2, User, LogOut, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    DEVTO_API_KEY: '',
    HASHNODE_API_KEY: '',
    HASHNODE_PUBLICATION_ID: '',
    OLLAMA_API_KEY: '',
    OLLAMA_BASE_URL: 'http://localhost:11434',
    OLLAMA_MODEL: 'llama3',
    GEMINI_API_KEY: '',
    GEMINI_MODEL: 'gemini-2.0-flash',
  });
  const [saving, setSaving] = useState(false);
  const [authStatus, setAuthStatus] = useState({ connected: false, user: null });

  useEffect(() => {
    getSettings().then(r => setSettings(prev => ({ ...prev, ...r.data }))).catch(console.error);
    getAuthStatus().then(r => setAuthStatus(r.data)).catch(console.error);
    // Handle callback params
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      toast.success(`Connected as ${params.get('email') || 'Google User'}!`);
      window.history.replaceState({}, '', '/settings');
    }
    if (params.get('error')) {
      toast.error('Google authentication failed. Try again.');
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      toast.success('Settings saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleConnect = async () => {
    try {
      const res = await getAuthUrl();
      window.location.href = res.data.authUrl;
    } catch { toast.error('Failed to get auth URL'); }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setAuthStatus({ connected: false, user: null });
      toast.success('Logged out from Google');
    } catch { toast.error('Logout failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure API keys and integrations</p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:700 }}>

        {/* Target URL Info */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <Link2 size={16} color="var(--cyan)"/>
            <h3 className="card-title mb-0">Target URL (Fixed)</h3>
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:10 }}>This system exclusively promotes the following URL. This cannot be changed.</p>
          <div style={{ background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.2)', borderRadius:8, padding:'12px 16px', fontFamily:'monospace', fontSize:14, color:'var(--cyan)' }}>
            https://www.ccbp.in/intensive
          </div>
        </div>

        {/* Google Account */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <Mail size={16} color={authStatus.connected ? 'var(--green)' : 'var(--text-muted)'}/>
            <h3 className="card-title mb-0">Google Account</h3>
            {authStatus.connected && <span className="badge badge-published">Connected</span>}
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
            Used for Gmail outreach drafts and Google Search Console performance data.
          </p>

          {authStatus.connected && authStatus.user ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#00d4ff,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <User size={16} color="#080c18"/>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{authStatus.user.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{authStatus.user.email}</div>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}><LogOut size={12}/> Disconnect</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleConnect}>
              Connect Google Account
            </button>
          )}

          <div className="alert alert-info" style={{ marginTop:14, marginBottom:0 }}>
            <span>✓ Gmail: Create outreach email drafts (you send manually) &nbsp; ✓ GSC: View clicks, impressions, keyword rankings</span>
          </div>
        </div>

        {/* Dev.to */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <Key size={16} color="var(--text-muted)"/>
            <h3 className="card-title mb-0">Dev.to API Key</h3>
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12 }}>
            Get your API key from <a href="https://dev.to/settings/extensions" target="_blank" rel="noreferrer" className="text-cyan">dev.to/settings/extensions</a>
          </p>
          <div className="form-group mb-0">
            <input
              className="form-input"
              type="password"
              value={settings.DEVTO_API_KEY || ''}
              onChange={e => setSettings({...settings, DEVTO_API_KEY: e.target.value})}
              placeholder="Your Dev.to API key"
            />
          </div>
        </div>

        {/* Hashnode */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <Key size={16} color="var(--text-muted)"/>
            <h3 className="card-title mb-0">Hashnode API</h3>
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12 }}>
            Get your API key from <a href="https://hashnode.com/settings/developer" target="_blank" rel="noreferrer" className="text-cyan">hashnode.com/settings/developer</a>
          </p>
          <div className="form-row">
            <div className="form-group mb-0">
              <label className="form-label">API Key</label>
              <input className="form-input" type="password" value={settings.HASHNODE_API_KEY || ''} onChange={e => setSettings({...settings, HASHNODE_API_KEY: e.target.value})} placeholder="Hashnode API key"/>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Publication ID</label>
              <input className="form-input" value={settings.HASHNODE_PUBLICATION_ID || ''} onChange={e => setSettings({...settings, HASHNODE_PUBLICATION_ID: e.target.value})} placeholder="Your publication ID"/>
            </div>
          </div>
        </div>

        {/* Ollama Info */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <BarChart2 size={16} color="var(--purple)"/>
            <h3 className="card-title mb-0">Ollama AI (Alternative)</h3>
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12 }}>
            Use a local or hosted Ollama instance when Gemini is unavailable.
          </p>
          <div className="form-group">
            <label className="form-label">Ollama API Key (Optional)</label>
            <input className="form-input" type="password" value={settings.OLLAMA_API_KEY || ''} onChange={e => setSettings({...settings, OLLAMA_API_KEY: e.target.value})} placeholder="API key if required by your provider"/>
          </div>
          <div className="form-row">
            <div className="form-group mb-0">
              <label className="form-label">Base URL</label>
              <input className="form-input" value={settings.OLLAMA_BASE_URL || ''} onChange={e => setSettings({...settings, OLLAMA_BASE_URL: e.target.value})} placeholder="http://localhost:11434"/>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Model</label>
              <input className="form-input" value={settings.OLLAMA_MODEL || ''} onChange={e => setSettings({...settings, OLLAMA_MODEL: e.target.value})} placeholder="llama3"/>
            </div>
          </div>
        </div>

        {/* Gemini info */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <BarChart2 size={16} color="var(--cyan)"/>
            <h3 className="card-title mb-0">Primary AI (Gemini)</h3>
            <span className="badge badge-published">Active</span>
          </div>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12 }}>
            Configure your Google Gemini AI settings.
          </p>
          <div className="form-group">
            <label className="form-label">Gemini API Key</label>
            <input className="form-input" type="password" value={settings.GEMINI_API_KEY || ''} onChange={e => setSettings({...settings, GEMINI_API_KEY: e.target.value})} placeholder="AIzaSy..."/>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Model</label>
            <input className="form-input" value={settings.GEMINI_MODEL || ''} onChange={e => setSettings({...settings, GEMINI_MODEL: e.target.value})} placeholder="gemini-2.0-flash"/>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf:'flex-start' }}>
          {saving ? <><RefreshCw size={14} style={{ animation:'spin 0.8s linear infinite' }}/> Saving...</> : <><Check size={14}/> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
