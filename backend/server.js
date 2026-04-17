const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const researchRoutes = require('./routes/research');
const sessionRoutes = require('./routes/sessions');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Curalink API running' });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/curalink?retryWrites=true&w=majority') {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } else {
      console.log('⚠️  MongoDB URI not set — running without DB (sessions stored in memory)');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('⚠️  Running without MongoDB — sessions will not persist');
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Curalink server running on port ${PORT}`);
  console.log(`🤖 LLM Model: ${process.env.LLM_MODEL || 'mistral'}`);
  console.log(`🔗 Ollama: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
});
