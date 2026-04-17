import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PublicationCard from './PublicationCard';
import TrialCard from './TrialCard';

export default function Message({ msg }) {
  const [activeTab, setActiveTab] = useState('publications');
  const isUser = msg.role === 'user';
  const pubs = msg.publications || [];
  const trials = msg.trials || [];
  const hasSources = pubs.length > 0 || trials.length > 0;

  if (isUser) {
    return (
      <div style={styles.userRow} className="fade-in">
        <div style={styles.userBubble}>
          <div style={styles.userIcon}>YOU</div>
          <div style={styles.userContent}>{msg.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.assistantRow} className="fade-in">
      <div style={styles.assistantHeader}>
        <span style={styles.aiIcon}>⚕</span>
        <span style={styles.aiLabel}>CURALINK AI</span>
        {msg.meta && (
          <div style={styles.metaChips}>
            <span style={styles.chip}>📚 {msg.meta.sources?.pubmed || 0} PubMed</span>
            <span style={styles.chip}>🌐 {msg.meta.sources?.openalex || 0} OpenAlex</span>
            <span style={styles.chip}>🧪 {msg.meta.sources?.trials || 0} Trials</span>
            {msg.meta.totalRetrieved && (
              <span style={{ ...styles.chip, color: 'var(--accent-amber)' }}>
                {msg.meta.totalRetrieved} retrieved → {(msg.publications?.length || 0) + (msg.trials?.length || 0)} selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* AI Response */}
      <div style={msg.isError ? styles.errorContent : styles.aiContent}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="markdown-body"
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>
                {children}
              </a>
            ),
          }}
        >
          {msg.content}
        </ReactMarkdown>
      </div>

      {/* Sources Panel */}
      {hasSources && (
        <div style={styles.sourcesPanel}>
          <div style={styles.tabBar}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'publications' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('publications')}
            >
              📚 Publications ({pubs.length})
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'trials' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('trials')}
            >
              🧪 Clinical Trials ({trials.length})
            </button>
          </div>

          <div style={styles.tabContent}>
            {activeTab === 'publications' && (
              pubs.length > 0
                ? pubs.map((p, i) => <PublicationCard key={p.id || i} pub={p} index={i} />)
                : <div style={styles.empty}>No publications retrieved for this query.</div>
            )}
            {activeTab === 'trials' && (
              trials.length > 0
                ? trials.map((t, i) => <TrialCard key={t.id || i} trial={t} index={i} />)
                : <div style={styles.empty}>No clinical trials found for this query.</div>
            )}
          </div>
        </div>
      )}

      <div style={styles.timestamp}>
        {new Date(msg.timestamp).toLocaleTimeString()}
        {msg.meta?.expandedQuery && (
          <span style={styles.expandedQuery}> · Query: "{msg.meta.expandedQuery}"</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 16,
    padding: '0 4px',
  },
  userBubble: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '75%',
  },
  userIcon: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    fontWeight: 700,
    color: 'var(--bg-primary)',
    background: 'var(--accent-primary)',
    padding: '4px 6px',
    borderRadius: 6,
    letterSpacing: 1,
    marginTop: 2,
    flexShrink: 0,
  },
  userContent: {
    background: 'linear-gradient(135deg, #0f2744 0%, #162035 100%)',
    border: '1px solid var(--accent-primary)',
    borderRadius: '12px 12px 4px 12px',
    padding: '10px 14px',
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--text-primary)',
  },
  assistantRow: {
    marginBottom: 20,
    padding: '0 4px',
  },
  assistantHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  aiIcon: { fontSize: 18 },
  aiLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    color: 'var(--accent-primary)',
  },
  metaChips: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    fontSize: 10,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '2px 8px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  aiContent: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '4px 12px 12px 12px',
    padding: '16px 18px',
    marginBottom: 12,
  },
  errorContent: {
    background: 'rgba(239,68,68,0.05)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '4px 12px 12px 12px',
    padding: '16px 18px',
    marginBottom: 12,
  },
  sourcesPanel: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  tabBar: {
    display: 'flex',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
  },
  tab: {
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: 'var(--accent-primary)',
    borderBottom: '2px solid var(--accent-primary)',
    background: 'var(--bg-card)',
  },
  tabContent: {
    padding: 12,
    background: 'var(--bg-primary)',
    maxHeight: 500,
    overflowY: 'auto',
  },
  empty: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '20px',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 10,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  expandedQuery: {
    color: 'var(--accent-secondary)',
  },
};
