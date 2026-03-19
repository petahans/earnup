const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Non-browser requests (e.g. curl / server-to-server) have no Origin header
    if (!origin) return callback(null, true);

    // If explicitly configured, only allow those origins
    if (allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }

    const defaultProdOrigins = ['https://earnup-udhe.onrender.com'];
    const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:3000'];

    // Development default: be permissive
    if (process.env.NODE_ENV !== 'production') {
      if (defaultDevOrigins.includes(origin)) return callback(null, true);
      return callback(null, true);
    }

    // Production default fallback: allow known frontend origin
    if (defaultProdOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: '⚡ EarnUp Backend läuft!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});