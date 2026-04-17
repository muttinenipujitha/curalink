import React, { useState } from 'react';

export default function PublicationCard({ pub, index }) {
  const [expanded, setExpanded] = useState(false);

  const sourceColor = pub.source === 'PubMed' ? '#06b6d4' : '#8b5cf6';
  const sourceBg = pub.source === 'PubMed' ? 'rgba(6,182,212,0.1)' : 'rgba(139,92,246,0.1)';

  return (
    <div style={styles.card} className="fade-in">
      <div style={styles.header}>
        <span style={styles.index}>[{index + 1}]</span>
        <span style={{ ...styles.sourceBadge, color: sourceColor, background: sourceBg }}>
          {pub.source}
        </span>
        <span style={styles.year}>{pub.year}</span>
      </div>

      <a href={pub.url} target="_blank" rel="noreferrer" style={styles.title}>
        {pub.title}
      </a>

      {pub.authors?.length > 0 && (
        <div style={styles.authors}>
          👤 {pub.authors.slice(0, 3).join(', ')}{pub.authors.length > 3 ? ` +${pub.authors.length - 3} more` : ''}
        </div>
      )}

      {pub.journal && (
        <div style={styles.journal}>📰 {pub.journal}</div>
      )}

      {pub.abstract && pub.abstract !== 'Abstract not available' && (
        <div>
          <div style={{ ...styles.abstract, WebkitLineClamp: expanded ? 'unset' : 3 }}>
            {pub.abstract}
          </div>
          <button style={styles.toggleBtn} onClick={() => setExpanded(!expanded)}>
            {expanded ? '▲ Show less' : '▼ Read more'}
          </button>
        </div>
      )}

      {pub.citedBy > 0 && (
        <div style={styles.citations}>📊 Cited by {pub.citedBy}</div>
      )}

      <a href={pub.url} target="_blank" rel="noreferrer" style={styles.link}>
        Open Publication →
      </a>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    marginBottom: 10,
    transition: 'border-color 0.2s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  index: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  sourceBadge: {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    letterSpacing: 1,
    padding: '2px 8px',
    borderRadius: 20,
  },
  year: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginLeft: 'auto',
    fontFamily: 'var(--font-mono)',
  },
  title: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--accent-primary)',
    marginBottom: 6,
    lineHeight: 1.4,
    textDecoration: 'none',
  },
  authors: {
    fontSize: 11,
    color: 'var(--text-secondary)',
    marginBottom: 4,
  },
  journal: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  abstract: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: 4,
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-primary)',
    fontSize: 11,
    cursor: 'pointer',
    padding: '2px 0',
    fontFamily: 'var(--font-mono)',
  },
  citations: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 6,
  },
  link: {
    display: 'inline-block',
    marginTop: 8,
    fontSize: 11,
    color: 'var(--accent-primary)',
    fontFamily: 'var(--font-mono)',
    textDecoration: 'none',
  },
};
