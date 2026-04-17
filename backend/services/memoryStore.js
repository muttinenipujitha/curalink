// In-memory session store (fallback when MongoDB is unavailable)
const sessions = new Map();

class MemorySessionStore {
  async findOne(query) {
    const id = query.sessionId;
    return sessions.get(id) || null;
  }

  async findOneAndUpdate(query, update, options) {
    const id = query.sessionId;
    let session = sessions.get(id);
    
    if (!session && options?.upsert) {
      session = {
        sessionId: id,
        patientContext: {},
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    if (!session) return null;
    
    if (update.$set) {
      Object.assign(session, update.$set);
    }
    if (update.$push?.messages) {
      session.messages = session.messages || [];
      session.messages.push(update.$push.messages);
    }
    
    session.updatedAt = new Date();
    sessions.set(id, session);
    return session;
  }

  async find() {
    return Array.from(sessions.values())
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 20);
  }
}

module.exports = new MemorySessionStore();
