import React, { createContext, useContext, useState, useCallback } from 'react';
import { sendMessage } from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientContext, setPatientContext] = useState({ name: '', disease: '', location: '', additionalInfo: '' });
  const [lastMeta, setLastMeta] = useState(null);
  const [error, setError] = useState(null);

  const sendChat = useCallback(async (userMessage) => {
    setError(null);
    const userMsg = { role: 'user', content: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await sendMessage({
        message: userMessage,
        sessionId,
        patientContext,
      });

      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      setLastMeta(data.meta);

      const assistantMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        publications: data.publications || [],
        trials: data.trials || [],
        meta: data.meta,
      };
      setMessages(prev => [...prev, assistantMsg]);
      return assistantMsg;
    } catch (err) {
      const errMsg = err.response?.data?.details || err.message || 'Something went wrong';
      setError(errMsg);
      const errorMsg = {
        role: 'assistant',
        content: `❌ **Error:** ${errMsg}\n\nPlease check that the backend server is running on port 5000.`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, patientContext]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setLastMeta(null);
    setError(null);
  }, []);

  const updatePatientContext = useCallback((ctx) => {
    setPatientContext(prev => ({ ...prev, ...ctx }));
  }, []);

  return (
    <ChatContext.Provider value={{
      messages, isLoading, patientContext, sessionId, lastMeta, error,
      sendChat, clearChat, updatePatientContext,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
