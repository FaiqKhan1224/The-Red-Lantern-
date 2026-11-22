import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import auth from './routes/auth.js';
import reservations from './routes/reservations.js';
import { menu, gallery, enquiries, contact, settings } from './routes/content.js';


const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.set('trust proxy', 1);
app.use(morgan(process.env.VERCEL ? 'combined' : 'dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600 }));

// Health check needs no database or secrets.
app.get('/api/health', (_q, res) => res.json({ ok: true }));

// Everything below needs MongoDB (and JWT_SECRET for auth). On serverless the connection is
// opened lazily and reused, so this MUST run before the auth router as well.
app.use('/api', async (_q, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set.');
    return res.status(500).json({ message: 'Server is not configured (missing JWT_SECRET).' });
  }
  try { await connectDB(); next(); } catch (e) { console.error(e); res.status(503).json({ message: 'Database unavailable. Please try again shortly.' }); }
});
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 40 }), auth);
app.use('/api/reservations', reservations);
app.use('/api/menu', menu);
app.use('/api/gallery', gallery);
app.use('/api/enquiries', enquiries);
app.use('/api/contact', contact);
app.use('/api/settings', settings);

app.use((_q, res) => res.status(404).json({ message: 'Not found.' }));
app.use((err, _q, res, _n) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(' ') });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side.' });
});

export default app;
