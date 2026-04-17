import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';

export default function ChatWindow() {
  const { messages, isLoading } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.length === 0 && <WelcomeScreen />}
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      <ChatInput />
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div style={styles.welcome}>
      <div style={styles.welcomeIcon}>⚕</div>
      <h1 style={styles.welcomeTitle}>Curalink</h1>
      <p style={styles.welcomeSubtitle}>AI-Powered Medical Research Assistant</p>
      <p style={styles.welcomeDesc}>
        Ask about diseases, treatments, clinical trials, or researchers.<br />
        I retrieve live data from <strong>PubMed</strong>, <strong>OpenAlex</strong>, and <strong>ClinicalTrials.gov</strong>,<br />
        then reason over hundreds of papers to give you structured, source-backed insights.
      </p>
      <div style={styles.featureGrid}>
        {[
          { icon: '🔬', title: 'Deep Retrieval', desc: 'Broad candidate pool (50–300 results), filtered & ranked' },
          { icon: '🧠', title: 'LLM Reasoning', desc: 'Powered by Groq (free) — LLaMA 3, Mixtral, Gemma2' },
          { icon: '🧪', title: 'Clinical Trials', desc: 'Live data from ClinicalTrials.gov with eligibility & contacts' },
          { icon: '💬', title: 'Context Aware', desc: 'Multi-turn conversations with patient-specific personalization' },
        ].map((f, i) => (
          <div key={i} style={styles.featureCard}>
            <span style={styles.featureIcon}>{f.icon}</span>
            <div>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <p style={styles.disclaimer}>
        ⚠️ For research purposes only. Always consult a qualified healthcare professional.
      </p>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
  },
  welcome: {
    maxWidth: 680,
    margin: '20px auto',
    textAlign: 'center',
  },
  welcomeIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 42,
    fontWeight: 600,
    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    letterSpacing: 3,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  welcomeDesc: {
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    fontSize: 14,
    marginBottom: 28,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 24,
    textAlign: 'left',
  },
  featureCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 14px',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  featureIcon: { fontSize: 22, flexShrink: 0 },
  featureTitle: {
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 3,
    color: 'var(--text-primary)',
  },
  featureDesc: {
    fontSize: 11,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  disclaimer: {
    fontSize: 11,
    color: 'var(--text-muted)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 14px',
  },
};
