import { Router } from 'express';
import { Reservation } from '../models/index.js';
import { protect, adminOnly, optionalAuth, wrap } from '../middleware/auth.js';
import { sendReservationEmail } from '../services/emails.js';

const r = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const today = () => new Date().toISOString().slice(0, 10);
const validDate = (d) => DATE_RE.test(d) && !isNaN(new Date(`${d}T12:00:00Z`));
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ───────────── Create a reservation ─────────────
r.post('/', optionalAuth, wrap(async (req, res) => {
  const b = req.body;
  const email = String(b.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (!validDate(b.date) || b.date < today()) return res.status(400).json({ message: 'Please choose a date from today onwards.' });
  if (!TIME_RE.test(String(b.time || ''))) return res.status(400).json({ message: 'Please choose a valid time.' });

  const doc = new Reservation({
    firstName: b.firstName, lastName: b.lastName, email, phone: b.phone, date: b.date, time: b.time,
    guests: Number(b.guests), experience: b.experience, occasion: b.occasion, requests: b.requests,
    user: req.user?._id,
  });
  await doc.validate();
  doc.history.push({ action: 'created', by: `${doc.firstName} ${doc.lastName}`, status: 'pending', date: doc.date, time: doc.time, guests: doc.guests });
  await doc.save();

  const mail = await sendReservationEmail('received', doc);
  res.status(201).json({
    reference: doc.reference, date: doc.date, time: doc.time, guests: doc.guests, experience: doc.experience,
    status: doc.status, firstName: doc.firstName, email: doc.email, emailSent: mail.sent,
  });
}));

// ───────────── Customer: my reservations ─────────────
r.get('/mine', protect, wrap(async (req, res) => {
  const rows = await Reservation.find({ user: req.user._id }).sort({ date: -1, time: -1 }).lean();
  res.json(rows.map(({ user, __v, ...rest }) => rest));
}));

// ───────────── Admin ─────────────
r.get('/summary', protect, adminOnly, wrap(async (_q, res) => {
  const t = today();
  const by = Object.fromEntries((await Reservation.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }])).map((x) => [x._id, x.n]));
  const upcoming = await Reservation.countDocuments({ date: { $gte: t }, status: { $in: ['pending', 'confirmed'] } });
  const past = await Reservation.countDocuments({ date: { $lt: t } });
  const all = Object.values(by).reduce((a, b) => a + b, 0);
  res.json({ pending: by.pending || 0, confirmed: by.confirmed || 0, rejected: by.rejected || 0, cancelled: by.cancelled || 0, completed: by.completed || 0, upcoming, past, all });
}));

r.get('/', protect, adminOnly, wrap(async (req, res) => {
  const { status, experience, date, scope, q, sort } = req.query;
  const f = {};
  if (status) f.status = status;
  if (experience) f.experience = experience;
  if (date) f.date = date;
  if (scope === 'upcoming') { f.date = { $gte: today() }; f.status = { $in: ['pending', 'confirmed'] }; }
  if (scope === 'past') f.date = { $lt: today() };
  if (q && String(q).trim()) {
    const rx = new RegExp(esc(String(q).trim()), 'i');
    f.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { reference: rx }, { phone: rx },
      { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: esc(String(q).trim()), options: 'i' } } }];
  }
  const dir = sort === 'desc' ? -1 : 1;
  res.json(await Reservation.find(f).sort({ date: dir, time: dir }).limit(500));
}));

// Allowed starting states for each admin action
const RULES = {
  confirm: { from: ['pending', 'rejected', 'cancelled'], to: 'confirmed' },
  reject: { from: ['pending', 'confirmed'], to: 'rejected' },
  cancel: { from: ['pending', 'confirmed'], to: 'cancelled' },
  complete: { from: ['confirmed'], to: 'completed' },
  update: { from: ['pending', 'confirmed'], to: null },
  message: { from: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'], to: null },
};

r.patch('/:id', protect, adminOnly, wrap(async (req, res) => {
  const { action, date, time, guests } = req.body;
  const message = String(req.body.message || '').trim().slice(0, 1000);
  const rule = RULES[action];
  if (!rule) return res.status(400).json({ message: 'Unknown action.' });
  const doc = await Reservation.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Reservation not found.' });
  if (!rule.from.includes(doc.status)) return res.status(400).json({ message: `This reservation is already ${doc.status}, so it can't be ${{ confirm: 'confirmed', reject: 'rejected', cancel: 'cancelled', complete: 'marked as completed', update: 'updated' }[action] || 'changed this way'}.` });

  // Detect changes to date / time / guests
  const changes = [];
  if (date !== undefined && date !== doc.date) {
    if (!validDate(date)) return res.status(400).json({ message: 'Invalid date.' });
    if (date < today() && action !== 'complete') return res.status(400).json({ message: 'The new date cannot be in the past.' });
    changes.push({ field: 'date', from: doc.date, to: date });
  }
  if (time !== undefined && time !== doc.time) {
    if (!TIME_RE.test(String(time))) return res.status(400).json({ message: 'Invalid time.' });
    changes.push({ field: 'time', from: doc.time, to: time });
  }
  if (guests !== undefined && Number(guests) !== doc.guests) {
    const g = Number(guests);
    if (!Number.isInteger(g) || g < 1 || g > 20) return res.status(400).json({ message: 'Guests must be between 1 and 20.' });
    changes.push({ field: 'guests', from: doc.guests, to: g });
  }
  if (action === 'update' && !changes.length && !message) return res.status(400).json({ message: 'Nothing to update. Change the date, time or guests, or add a message.' });
  if (action === 'message' && !message) return res.status(400).json({ message: 'Please write a message to send.' });

  for (const c of changes) doc[c.field] = c.to;
  if (rule.to) doc.status = rule.to;
  doc.adminMessage = message;
  doc.history.push({ action, by: req.user.name, status: doc.status, note: message, date: doc.date, time: doc.time, guests: doc.guests });
  await doc.save();

  // "confirm" with edits and "update" both tell the guest what changed
  const mail = await sendReservationEmail(action === 'update' && !changes.length ? 'message' : action, doc, { changes });
  res.json({ reservation: doc, emailSent: mail.sent, emailError: mail.error, sentTo: doc.email });
}));

r.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

export default r;
