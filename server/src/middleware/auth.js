import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

async function load(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(id);
  } catch {
    return null;
  }
}

export async function optionalAuth(req, _res, next) {
  req.user = await load(req);
  next();
}

export async function protect(req, res, next) {
  req.user = await load(req);
  if (!req.user) return res.status(401).json({ message: 'Please sign in to continue.' });
  next();
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}

export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
