require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const commentRoutes = require('./routes/commentRoutes');
const liveRoutes = require('./routes/liveRoutes');
const statsRoutes = require('./routes/statsRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('combined'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/news', newsRoutes);

// Route de santé
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (err) {
    console.error('Health check DB error:', err.message);
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: err.message });
  }
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('❌ Erreur non gérée:', err.stack);
  res.status(500).json({ error: 'Une erreur interne est survenue' });
});

const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`🌍 Health check: http://localhost:${PORT}/api/health`);
  });
} catch (err) {
  console.error('❌ Échec du démarrage du serveur:', err);
  process.exit(1);
}