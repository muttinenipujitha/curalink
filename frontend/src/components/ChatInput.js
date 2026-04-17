import React, { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';

const SUGGESTIONS = [
  'Latest treatment for lung cancer',
  'Clinical trials for diabetes',
  'Top researchers in Alzheimer\'s disease',
  'Recent studies on heart disease',
  'Deep Brain Stimulation for Parkinson\'s',
  'COVID-19 long haul treatment options',
];

export default function ChatInput() {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { sendChat, isLoading } = useChat();
  const textareaRef = useRef(null);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    setShowSuggestions(false);
    await sendChat(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (s) => {
    setInput(s);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div style={styles.container}>
      {/* Suggestions */}
      {showSuggestions && !input && (
        <div style={styles.suggestions}>
          <div style={styles.suggestionsLabel}>Try asking:</div>
          <div style={styles.suggestionsGrid}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} style={styles.suggestion} onClick={() => handleSuggestion(s)}>
                🔬 {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.inputRow}>
        <div style={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            style={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ask about a disease, treatment, clinical trial, or researcher..."
            rows={1}
            disabled={isLoading}
          />
        </div>

        <button
          style={{ ...styles.sendBtn, opacity: (!input.trim() || isLoading) ? 0.4 : 1 }}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <span style={styles.spinner} />
          ) : (
            <span style={styles.sendIcon}>↑</span>
          )}
        </button>
      </div>

      <div style={styles.hint}>
        <span>Press Enter to send · Shift+Enter for new line</span>
        <span>Sources: PubMed · OpenAlex · ClinicalTrials.gov</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '12px 16px 10px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
  },
  suggestions: {
    marginBottom: 10,
  },
  suggestionsLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  suggestionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestion: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: 11,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  textarea: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    padding: '12px 14px',
    resize: 'none',
    lineHeight: 1.5,
    maxHeight: 120,
    overflowY: 'auto',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--accent-primary)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
    flexShrink: 0,
  },
  sendIcon: {
    fontSize: 20,
    fontWeight: 700,
    color: '#000',
    lineHeight: 1,
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2px solid rgba(0,0,0,0.3)',
    borderTopColor: '#000',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'block',
  },
  hint: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 6,
    fontSize: 10,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
};
