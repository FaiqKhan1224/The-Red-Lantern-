import { Router } from 'express';
import { User } from '../models/index.js';
import { sign, protect, wrap } from '../middleware/auth.js';

const r = Router();
const strong = (p) => typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

r.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });
  if (!strong(password)) return res.status(400).json({ message: 'Password needs 8+ characters with letters and numbers.' });
  if (await User.findOne({ email: String(email).toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: sign(user), user: pub(user) });
}));

r.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matches(String(password || '')))) return res.status(401).json({ message: 'Incorrect email or password.' });
  res.json({ token: sign(user), user: pub(user) });
}));

r.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));

export default r;
