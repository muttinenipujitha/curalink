import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const QUICK_QUERIES = [
  { label: 'Lung Cancer Treatments', query: 'Latest treatment options for lung cancer', disease: 'lung cancer' },
  { label: 'Diabetes Trials', query: 'Clinical trials for type 2 diabetes', disease: 'diabetes' },
  { label: "Alzheimer's Research", query: "Top researchers and recent studies in Alzheimer's disease", disease: "alzheimer's" },
  { label: 'Heart Disease Studies', query: 'Recent studies on heart disease prevention', disease: 'heart disease' },
  { label: 'Parkinson\'s DBS', query: 'Deep Brain Stimulation for Parkinson\'s disease', disease: "parkinson's" },
  { label: 'COVID Long-Haul', query: 'Long COVID treatment and research', disease: 'COVID-19' },
];

export default function Sidebar({ onClose }) {
  const { patientContext, updatePatientContext, clearChat, sendChat, messages } = useChat();
  const [localCtx, setLocalCtx] = useState(patientContext);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updatePatientContext(localCtx);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleQuickQuery = (item) => {
    updatePatientContext({ ...localCtx, disease: item.disease });
    sendChat(item.query);
    if (onClose) onClose();
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>⚕</span>
        <div>
          <div style={styles.logoText}>CURALINK</div>
          <div style={styles.logoSub}>Medical Research AI</div>
        </div>
      </div>

      {/* Patient Context */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Patient Context</div>
        <input
          style={styles.input}
          placeholder="Patient name (optional)"
          value={localCtx.name}
          onChange={e => setLocalCtx(p => ({ ...p, name: e.target.value }))}
        />
        <input
          style={styles.input}
          placeholder="Disease / Condition *"
          value={localCtx.disease}
          onChange={e => setLocalCtx(p => ({ ...p, disease: e.target.value }))}
        />
        <input
          style={styles.input}
          placeholder="Location (e.g. Toronto, Canada)"
          value={localCtx.location}
          onChange={e => setLocalCtx(p => ({ ...p, location: e.target.value }))}
        />
        <textarea
          style={{ ...styles.input, height: 70, resize: 'vertical' }}
          placeholder="Additional context..."
          value={localCtx.additionalInfo}
          onChange={e => setLocalCtx(p => ({ ...p, additionalInfo: e.target.value }))}
        />
        <button style={saved ? styles.btnSaved : styles.btnSave} onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save Context'}
        </button>
      </div>

      {/* Quick Queries */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Quick Queries</div>
        {QUICK_QUERIES.map((item, i) => (
          <button key={i} style={styles.quickBtn} onClick={() => handleQuickQuery(item)}>
            <span style={styles.quickIcon}>🔬</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {messages.length > 0 && (
          <button style={styles.clearBtn} onClick={clearChat}>
            🗑 Clear Chat
          </button>
        )}
        <div style={styles.version}>v1.0.0 · Powered by Groq / HF / Ollama</div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 260,
    minWidth: 260,
    height: '100%',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 16px',
    borderBottom: '1px solid var(--border)',
  },
  logoIcon: { fontSize: 28 },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: 3,
    color: 'var(--accent-primary)',
  },
  logoSub: { fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 },
  section: {
    padding: '16px',
    borderBottom: '1px solid var(--border)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: 2,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    color: 'var(--text-primary)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
    marginBottom: 8,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btnSave: {
    width: '100%',
    padding: '8px',
    background: 'var(--accent-primary)',
    color: '#000',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 1,
    marginTop: 2,
    transition: 'opacity 0.2s',
  },
  btnSaved: {
    width: '100%',
    padding: '8px',
    background: 'var(--accent-green)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 1,
    marginTop: 2,
  },
  quickBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    cursor: 'pointer',
    marginBottom: 6,
    textAlign: 'left',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-sans)',
  },
  quickIcon: { fontSize: 14, flexShrink: 0 },
  actions: {
    padding: 16,
    marginTop: 'auto',
  },
  clearBtn: {
    width: '100%',
    padding: '8px',
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12,
    cursor: 'pointer',
    marginBottom: 12,
    fontFamily: 'var(--font-sans)',
    transition: 'color 0.2s',
  },
  version: {
    fontSize: 10,
    color: 'var(--text-muted)',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
  },
};
