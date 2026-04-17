const mongoose = require('mongoose');
const memoryStore = require('./memoryStore');

function getStore() {
  if (mongoose.connection.readyState === 1) {
    return require('../models/Session');
  }
  return memoryStore;
}

async function getOrCreateSession(sessionId, patientContext = {}) {
  const store = getStore();
  try {
    const session = await store.findOneAndUpdate(
      { sessionId },
      {
        $set: { 
          'patientContext': patientContext,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    return session;
  } catch (e) {
    console.error('Session error:', e.message);
    return { sessionId, messages: [], patientContext };
  }
}

async function addMessage(sessionId, message) {
  const store = getStore();
  try {
    return await store.findOneAndUpdate(
      { sessionId },
      { 
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );
  } catch (e) {
    console.error('Add message error:', e.message);
    return null;
  }
}

async function getSession(sessionId) {
  const store = getStore();
  try {
    return await store.findOne({ sessionId });
  } catch (e) {
    return null;
  }
}

async function getAllSessions() {
  const store = getStore();
  try {
    if (store.find) {
      return await store.find().sort?.({ updatedAt: -1 }).limit?.(20) || await store.find();
    }
    return [];
  } catch (e) {
    return [];
  }
}

module.exports = { getOrCreateSession, addMessage, getSession, getAllSessions };
