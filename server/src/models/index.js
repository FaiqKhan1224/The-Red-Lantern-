import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;
const opts = { timestamps: true };

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['guest', 'admin'], default: 'guest' },
  },
  opts
);
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matches = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const reservationSchema = new Schema(
  {
    reference: { type: String, unique: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1, max: 20 },
    experience: { type: String, enum: ['Dining Room', 'Private Dining', "Chef's Experience"], default: 'Dining Room' },
    occasion: { type: String, default: 'None' },
    requests: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'], default: 'pending' },
    adminMessage: { type: String, default: '', maxlength: 1000 },
    history: [
      {
        _id: false,
        at: { type: Date, default: Date.now },
        action: String, // created | confirm | reject | cancel | update | complete | message
        by: String,
        status: String,
        note: { type: String, default: '' },
        date: String,
        time: String,
        guests: Number,
      },
    ],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  opts
);
reservationSchema.pre('validate', function (next) {
  if (!this.reference) this.reference = 'RL-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  next();
});

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Signatures', 'Dim Sum', 'Main Courses', 'Vegetarian', 'Rice & Noodles', 'Desserts', 'Tea & Beverages'],
    },
    dietary: [{ type: String, enum: ['V', 'VG', 'GF', 'SPICY'] }],
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  opts
);

const galleryImageSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: 'The Dining Room' },
    url: { type: String, required: true },
    size: { type: String, enum: ['small', 'wide', 'tall', 'large'], default: 'small' },
    order: { type: Number, default: 0 },
  },
  opts
);

const eventEnquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    eventType: { type: String, required: true },
    date: { type: String, default: '' },
    guests: { type: Number, default: 10 },
    message: { type: String, default: '', maxlength: 2000 },
    status: { type: String, enum: ['new', 'contacted', 'confirmed', 'closed'], default: 'new' },
  },
  opts
);

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: 'General enquiry' },
    message: { type: String, required: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  opts
);

const settingsSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    name: { type: String, default: 'The Red Lantern' },
    address: { type: String, default: '128 Heritage Lane, London, W1K 3AB' },
    phone: { type: String, default: '+44 20 7123 4567' },
    email: { type: String, default: 'hello@redlantern.com' },
    instagram: { type: String, default: 'https://instagram.com' },
    facebook: { type: String, default: 'https://facebook.com' },
    tripadvisor: { type: String, default: 'https://tripadvisor.com' },
    hours: {
      type: [{ day: String, open: String, close: String, closed: Boolean }],
      default: [
        { day: 'Monday', closed: true },
        { day: 'Tuesday', open: '12:00', close: '22:00' },
        { day: 'Wednesday', open: '12:00', close: '22:00' },
        { day: 'Thursday', open: '12:00', close: '22:00' },
        { day: 'Friday', open: '12:00', close: '23:00' },
        { day: 'Saturday', open: '12:00', close: '23:00' },
        { day: 'Sunday', open: '12:00', close: '21:00' },
      ],
    },
  },
  opts
);

export const User = model('User', userSchema);
export const Reservation = model('Reservation', reservationSchema);
export const MenuItem = model('MenuItem', menuItemSchema);
export const GalleryImage = model('GalleryImage', galleryImageSchema);
export const EventEnquiry = model('EventEnquiry', eventEnquirySchema);
export const ContactMessage = model('ContactMessage', contactMessageSchema);
export const RestaurantSettings = model('RestaurantSettings', settingsSchema);
