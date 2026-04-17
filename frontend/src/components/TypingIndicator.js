import React from 'react';

export default function TypingIndicator({ meta }) {
  return (
    <div style={styles.row} className="fade-in">
      <div style={styles.header}>
        <span style={styles.icon}>⚕</span>
        <span style={styles.label}>CURALINK AI</span>
        <span style={styles.status}>researching...</span>
      </div>
      <div style={styles.bubble}>
        <div style={styles.pipeline}>
          <Step icon="🔍" text="Expanding query with LLM" delay={0} />
          <Step icon="📡" text="Fetching PubMed publications" delay={0.3} />
          <Step icon="🌐" text="Searching OpenAlex database" delay={0.6} />
          <Step icon="🧪" text="Querying ClinicalTrials.gov" delay={0.9} />
          <Step icon="🧠" text="Ranking & reasoning..." delay={1.2} />
        </div>
        <div style={styles.dots}>
          <span style={{ ...styles.dot, animationDelay: '0s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}

function Step({ icon, text, delay }) {
  return (
    <div style={{ ...styles.step, animationDelay: `${delay}s` }} className="slide-in">
      <span>{icon}</span>
      <span style={styles.stepText}>{text}</span>
      <span style={styles.spinner} />
    </div>
  );
}

const styles = {
  row: { marginBottom: 16, padding: '0 4px' },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: { fontSize: 18 },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    color: 'var(--accent-primary)',
  },
  status: {
    fontSize: 10,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    animation: 'pulse 1.5s infinite',
  },
  bubble: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '4px 12px 12px 12px',
    padding: '14px 16px',
  },
  pipeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: 'var(--text-secondary)',
    opacity: 0,
    animation: 'fadeIn 0.4s ease forwards',
  },
  stepText: { flex: 1 },
  spinner: {
    width: 10,
    height: 10,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  dots: {
    display: 'flex',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    background: 'var(--accent-primary)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'typingDot 1.2s infinite ease-in-out',
    opacity: 0.7,
  },
};
