import React, { useState } from 'react';
import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import StatusBar from './components/StatusBar';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ChatProvider>
      <div style={styles.app}>
        {/* Top status bar */}
        <StatusBar />

        <div style={styles.body}>
          {/* Sidebar toggle (mobile) */}
          <button
            style={styles.menuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          {/* Sidebar */}
          {sidebarOpen && (
            <Sidebar onClose={() => setSidebarOpen(false)} />
          )}

          {/* Main chat */}
          <ChatWindow />
        </div>
      </div>
    </ChatProvider>
  );
}

const styles = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
  menuBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 100,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    width: 28,
    height: 28,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
