import { Router } from 'express';
import { MenuItem, GalleryImage, EventEnquiry, ContactMessage, RestaurantSettings } from '../models/index.js';
import { protect, adminOnly, wrap } from '../middleware/auth.js';

const admin = [protect, adminOnly];

function crud(Model, sort, publicList = true) {
  const r = Router();
  if (publicList) r.get('/', wrap(async (_q, res) => res.json(await Model.find().sort(sort))));
  r.post('/', ...admin, wrap(async (req, res) => res.status(201).json(await Model.create(req.body))));
  r.put('/:id', ...admin, wrap(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Not found.' });
    res.json(doc);
  }));
  r.delete('/:id', ...admin, wrap(async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));
  return r;
}

export const menu = crud(MenuItem, { order: 1, createdAt: 1 });
export const gallery = crud(GalleryImage, { order: 1, createdAt: 1 });

// Enquiries: public POST, admin read/update
export const enquiries = Router();
enquiries.post('/', wrap(async (req, res) => {
  const d = await EventEnquiry.create(req.body);
  res.status(201).json({ ok: true, id: d._id });
}));
enquiries.get('/', ...admin, wrap(async (_q, res) => res.json(await EventEnquiry.find().sort({ createdAt: -1 }))));
enquiries.put('/:id', ...admin, wrap(async (req, res) => res.json(await EventEnquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }))));
enquiries.delete('/:id', ...admin, wrap(async (req, res) => { await EventEnquiry.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

// Contact messages
export const contact = Router();
contact.post('/', wrap(async (req, res) => {
  const d = await ContactMessage.create(req.body);
  res.status(201).json({ ok: true, id: d._id });
}));
contact.get('/', ...admin, wrap(async (_q, res) => res.json(await ContactMessage.find().sort({ createdAt: -1 }))));
contact.put('/:id', ...admin, wrap(async (req, res) => res.json(await ContactMessage.findByIdAndUpdate(req.params.id, { read: !!req.body.read }, { new: true }))));
contact.delete('/:id', ...admin, wrap(async (req, res) => { await ContactMessage.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

// Restaurant settings (single document)
export const settings = Router();
settings.get('/', wrap(async (_q, res) => {
  const s = (await RestaurantSettings.findOne({ key: 'main' })) || (await RestaurantSettings.create({ key: 'main' }));
  res.json(s);
}));
settings.put('/', ...admin, wrap(async (req, res) => {
  const { _id, key, createdAt, updatedAt, __v, ...rest } = req.body;
  res.json(await RestaurantSettings.findOneAndUpdate({ key: 'main' }, rest, { new: true, upsert: true, runValidators: true }));
}));
