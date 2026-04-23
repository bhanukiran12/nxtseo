import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PenLine, FileText, Link2, Mail,
  BarChart2, Settings, ChevronLeft, ChevronRight, Zap, ExternalLink
} from 'lucide-react';

const navItems = [
  { path: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/generate',   icon: PenLine,          label: 'Blog Generator' },
  { path: '/blogs',      icon: FileText,         label: 'My Blogs' },
  { path: '/backlinks',  icon: Link2,            label: 'Backlinks' },
  { path: '/outreach',   icon: Mail,             label: 'Outreach' },
  { path: '/performance',icon: BarChart2,        label: 'Performance' },
  { path: '/settings',   icon: Settings,         label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minWidth: collapsed ? 64 : 240,
      height: '100vh',
      background: 'rgba(13,18,37,0.95)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
      position: 'relative',
      zIndex: 10,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10, overflow:'hidden', minHeight:70 }}>
        <div style={{ width:36, height:36, background:'linear-gradient(135deg, #00d4ff, #a855f7)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft: collapsed ? 14 : 0 }}>
          <Zap size={18} color="#080c18" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#f0f4ff', lineHeight:1.2 }}>NxtSEO</div>
            <div style={{ fontSize:10, color:'#7986a8', fontWeight:500 }}>ccbp.in/intensive</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:2 }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <NavLink key={path} to={path} style={{ textDecoration:'none' }}>
              <div style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                borderRadius:9, cursor:'pointer', transition:'all 0.15s',
                background: active ? 'linear-gradient(90deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))' : 'transparent',
                border: active ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                color: active ? '#00d4ff' : '#7986a8',
                overflow: 'hidden', whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { if(!active){ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#f0f4ff'; } }}
              onMouseLeave={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#7986a8'; } }}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink:0 }} />
                {!collapsed && <span style={{ fontSize:13, fontWeight: active ? 600 : 400 }}>{label}</span>}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Target URL */}
      {!collapsed && (
        <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', margin:'0 8px 8px' }}>
          <div style={{ fontSize:10, color:'#4a5568', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Target URL</div>
          <a href="https://www.ccbp.in/intensive" target="_blank" rel="noreferrer"
            style={{ fontSize:11, color:'#00d4ff', display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}
          >
            ccbp.in/intensive <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        position:'absolute', top:24, right:-12,
        width:24, height:24, borderRadius:'50%',
        background:'#0d1225', border:'1px solid rgba(255,255,255,0.1)',
        color:'#7986a8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:20, transition:'all 0.15s'
      }}>
        {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
      </button>
    </aside>
  );
}
