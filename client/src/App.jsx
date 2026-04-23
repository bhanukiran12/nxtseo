import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BlogGenerator from './pages/BlogGenerator';
import BlogList from './pages/BlogList';
import BlogEditor from './pages/BlogEditor';
import BacklinkTracker from './pages/BacklinkTracker';
import OutreachManager from './pages/OutreachManager';
import PerformanceTracker from './pages/PerformanceTracker';
import Settings from './pages/Settings';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/generate"     element={<BlogGenerator />} />
            <Route path="/blogs"        element={<BlogList />} />
            <Route path="/blogs/:id"    element={<BlogEditor />} />
            <Route path="/backlinks"    element={<BacklinkTracker />} />
            <Route path="/outreach"     element={<OutreachManager />} />
            <Route path="/performance"  element={<PerformanceTracker />} />
            <Route path="/settings"     element={<Settings />} />
          </Routes>
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0d1225',
              color: '#f0f4ff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0d1225' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0d1225' } },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
