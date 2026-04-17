import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export const sendMessage = async ({ message, sessionId, patientContext }) => {
  const res = await api.post('/api/chat', { message, sessionId, patientContext });
  return res.data;
};

export const checkHealth = async () => {
  const res = await api.get('/api/chat/health');
  return res.data;
};

export const getSession = async (sessionId) => {
  const res = await api.get(`/api/sessions/${sessionId}`);
  return res.data;
};

export const getSessions = async () => {
  const res = await api.get('/api/sessions');
  return res.data;
};

export default api;
