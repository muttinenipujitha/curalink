import React, { useState } from 'react';

const STATUS_COLORS = {
  RECRUITING: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '🟢 Recruiting' },
  ACTIVE_NOT_RECRUITING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '🟡 Active' },
  COMPLETED: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: '⚫ Completed' },
  NOT_YET_RECRUITING: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: '🔵 Upcoming' },
  TERMINATED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '🔴 Terminated' },
  UNKNOWN: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: '⚪ Unknown' },
};

export default function TrialCard({ trial, index }) {
  const [expanded, setExpanded] = useState(false);
  const statusKey = trial.status?.toUpperCase().replace(/\s+/g, '_') || 'UNKNOWN';
  const statusStyle = STATUS_COLORS[statusKey] || STATUS_COLORS.UNKNOWN;

  return (
    <div style={styles.card} className="fade-in">
      <div style={styles.header}>
        <span style={styles.index}>[T{index + 1}]</span>
        <span style={{ ...styles.statusBadge, color: statusStyle.color, background: statusStyle.bg }}>
          {statusStyle.label}
        </span>
        {trial.phase && trial.phase !== 'Not specified' && (
          <span style={styles.phase}>{trial.phase}</span>
        )}
      </div>

      <a href={trial.url} target="_blank" rel="noreferrer" style={styles.title}>
        {trial.title}
      </a>

      {trial.nctId && (
        <div style={styles.nctId}>
          <span style={styles.nctBadge}>NCT</span> {trial.nctId}
        </div>
      )}

      {trial.summary && (
        <div style={styles.summary}>
          {expanded ? trial.summary : trial.summary.slice(0, 200) + (trial.summary.length > 200 ? '...' : '')}
          {trial.summary.length > 200 && (
            <button style={styles.toggleBtn} onClick={() => setExpanded(!expanded)}>
              {expanded ? ' ▲ less' : ' ▼ more'}
            </button>
          )}
        </div>
      )}

      <div style={styles.grid}>
        {trial.locations?.length > 0 && (
          <div style={styles.gridItem}>
            <span style={styles.gridLabel}>📍 Location</span>
            <span style={styles.gridValue}>{trial.locations.slice(0, 2).join(', ')}</span>
          </div>
        )}
        {trial.eligibility?.minAge !== 'Not specified' && (
          <div style={styles.gridItem}>
            <span style={styles.gridLabel}>👤 Age Range</span>
            <span style={styles.gridValue}>
              {trial.eligibility.minAge}{trial.eligibility.maxAge !== 'Not specified' ? ` – ${trial.eligibility.maxAge}` : '+'}
            </span>
          </div>
        )}
        {trial.eligibility?.sex && trial.eligibility.sex !== 'All' && (
          <div style={styles.gridItem}>
            <span style={styles.gridLabel}>⚥ Sex</span>
            <span style={styles.gridValue}>{trial.eligibility.sex}</span>
          </div>
        )}
        {trial.startDate && trial.startDate !== 'Unknown' && (
          <div style={styles.gridItem}>
            <span style={styles.gridLabel}>📅 Start</span>
            <span style={styles.gridValue}>{trial.startDate}</span>
          </div>
        )}
      </div>

      {trial.contact && (trial.contact.email || trial.contact.phone) && (
        <div style={styles.contact}>
          <span style={styles.contactLabel}>Contact:</span>
          {trial.contact.name && <span style={styles.contactName}>{trial.contact.name}</span>}
          {trial.contact.email && (
            <a href={`mailto:${trial.contact.email}`} style={styles.contactLink}>{trial.contact.email}</a>
          )}
          {trial.contact.phone && <span style={styles.contactPhone}>{trial.contact.phone}</span>}
        </div>
      )}

      <a href={trial.url} target="_blank" rel="noreferrer" style={styles.link}>
        View on ClinicalTrials.gov →
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
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  index: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  statusBadge: {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 20,
  },
  phase: {
    fontSize: 10,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    background: 'var(--bg-secondary)',
    padding: '2px 8px',
    borderRadius: 20,
    border: '1px solid var(--border)',
  },
  title: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--accent-green)',
    marginBottom: 6,
    lineHeight: 1.4,
    textDecoration: 'none',
  },
  nctId: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  nctBadge: {
    background: 'var(--bg-secondary)',
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: 9,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    border: '1px solid var(--border)',
  },
  summary: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-primary)',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    marginBottom: 10,
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  gridLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 11,
    color: 'var(--text-primary)',
  },
  contact: {
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    fontSize: 11,
    marginBottom: 10,
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  contactLabel: { color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 },
  contactName: { color: 'var(--text-primary)' },
  contactLink: { color: 'var(--accent-primary)', textDecoration: 'none' },
  contactPhone: { color: 'var(--text-secondary)' },
  link: {
    display: 'inline-block',
    fontSize: 11,
    color: 'var(--accent-green)',
    fontFamily: 'var(--font-mono)',
    textDecoration: 'none',
  },
};
