import React, { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';

export default function StatusBar() {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const data = await checkHealth();
        setHealth(data);
      } catch {
        setHealth({ llm: { online: false } });
      } finally {
        setChecking(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  if (checking) return null;

  const llmOnline = health?.llm?.online;
  const provider  = health?.llm?.provider || 'unknown';
  const model     = health?.model || 'llama-3.1-8b-instant';

  const providerLabel = {
    groq:         '⚡ Groq',
    huggingface:  '🤗 HuggingFace',
    ollama:       '🖥 Ollama',
    unknown:      '? Unknown',
  }[provider] || provider;

  return (
    <div style={styles.bar}>
      <div style={styles.item}>
        <span style={{ ...styles.dot, background: llmOnline ? '#10b981' : '#ef4444' }} />
        <span style={styles.label}>
          {llmOnline
            ? `${providerLabel} · ${model}`
            : `LLM Offline — set GROQ_API_KEY in backend/.env`}
        </span>
      </div>
      <div style={styles.item}>
        <span style={{ ...styles.dot, background: '#10b981' }} />
        <span style={styles.label}>PubMed · OpenAlex · ClinicalTrials.gov</span>
      </div>
      {!llmOnline && (
        <div style={styles.warning}>
          ⚠ Get free key → <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>console.groq.com</a>
        </div>
      )}
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '6px 16px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    fontSize: 11,
    flexWrap: 'wrap',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  label: {
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  warning: {
    color: 'var(--accent-amber)',
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
  },
  code: {
    background: 'var(--bg-card)',
    padding: '1px 5px',
    borderRadius: 3,
    fontSize: 10,
    color: 'var(--accent-primary)',
  },
};
