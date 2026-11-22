import './config/env.js';
import mongoose from 'mongoose';
import { User, MenuItem, GalleryImage, RestaurantSettings } from './models/index.js';

const U = (id, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

const menu = [
  ['Crispy Peking Duck', 'Traditional roast duck, cucumber, scallion, handmade pancakes.', 38, 'Signatures', [], true, 'photo-1518983546435-9a2f2b0c4a55'],
  ['Sichuan Chilli Prawns', 'Wok-fired king prawns, dried chilli, Sichuan pepper.', 29, 'Signatures', ['SPICY', 'GF'], true, 'photo-1565557623262-b51c2513a641'],
  ['Dragon Pearl Dumplings', 'Hand-pleated prawn and chive dumplings, black vinegar.', 16, 'Signatures', [], true, 'photo-1563245372-f21724e3856d'],
  ['Har Gow', 'Translucent prawn dumplings with bamboo shoot.', 12, 'Dim Sum', ['GF'], false, ''],
  ['Xiao Long Bao', 'Soup dumplings, pork and ginger broth.', 13, 'Dim Sum', [], false, ''],
  ['Vegetable Spring Rolls', 'Shiitake, cabbage and glass noodle.', 9, 'Dim Sum', ['V'], false, ''],
  ['Kung Pao Chicken', 'Roasted peanuts, dried chilli, aged vinegar.', 22, 'Main Courses', ['SPICY'], false, ''],
  ['Braised Beef Short Rib', 'Star anise, rock sugar, slow-cooked for six hours.', 34, 'Main Courses', [], false, ''],
  ['Steamed Sea Bass', 'Ginger, spring onion, hot sesame oil, light soy.', 32, 'Main Courses', ['GF'], false, ''],
  ['Mapo Tofu', 'Silken tofu, fermented bean paste, Sichuan pepper.', 18, 'Vegetarian', ['VG', 'SPICY'], false, ''],
  ['Garlic Bok Choy', 'Flash-fried greens, crisp garlic.', 11, 'Vegetarian', ['VG', 'GF'], false, ''],
  ['Yangzhou Fried Rice', 'Egg, char siu, prawn, spring onion.', 17, 'Rice & Noodles', [], false, ''],
  ['Dan Dan Noodles', 'Chilli oil, preserved vegetable, sesame.', 16, 'Rice & Noodles', ['SPICY'], false, ''],
  ['Mango Pomelo Sago', 'Chilled coconut cream, fresh mango, pomelo.', 10, 'Desserts', ['VG'], false, ''],
  ['Sesame Glutinous Balls', 'Warm black sesame filling, ginger syrup.', 9, 'Desserts', ['V'], false, ''],
  ['Jasmine Pearl Tea', 'Hand-rolled green tea, served in a pot.', 8, 'Tea & Beverages', ['VG'], false, ''],
  ['Pu-erh Aged Tea', 'Earthy, deep and smooth, aged eight years.', 11, 'Tea & Beverages', ['VG'], false, ''],
].map(([name, description, price, category, dietary, featured, img], i) => ({
  name, description, price, category, dietary, featured, order: i, image: img ? U(img, 1200) : '',
}));

const gallery = [
  ['The Dining Room', 'The Dining Room', 'photo-1552566626-52f8b828add9', 'large'],
  ['Lanterns at Dusk', 'The Lanterns', 'photo-1528360983277-13d401cdc186', 'tall'],
  ['Signature Duck', 'From the Kitchen', 'photo-1518983546435-9a2f2b0c4a55', 'small'],
  ['The Chef', 'The Chef', 'photo-1577219491135-ce391730fb2c', 'wide'],
  ['The Kitchen', 'From the Kitchen', 'photo-1556910103-1c02745aae4d', 'small'],
  ['Private Room', 'Private Dining', 'photo-1414235077428-338989a2e8c0', 'tall'],
  ['Dumplings', 'From the Kitchen', 'photo-1563245372-f21724e3856d', 'small'],
  ['Tea Ceremony', 'Details', 'photo-1556679343-c7306c1976bc', 'wide'],
  ['The Table', 'The Dining Room', 'photo-1517248135467-4c7edcad34c4', 'small'],
  ['Architecture', 'Heritage', 'photo-1508804185872-d7badad00f7d', 'tall'],
].map(([title, category, id, size], i) => ({ title, category, size, order: i, url: U(id, 1400) }));

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/red_lantern');
await MenuItem.deleteMany({}); await MenuItem.insertMany(menu);
await GalleryImage.deleteMany({}); await GalleryImage.insertMany(gallery);
await RestaurantSettings.findOneAndUpdate({ key: 'main' }, { key: 'main' }, { upsert: true, setDefaultsOnInsert: true });

const email = (process.env.ADMIN_EMAIL || 'admin@redlantern.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'ChangeMe@12345';
if (!(await User.findOne({ email }))) {
  await User.create({ name: 'Restaurant Admin', email, password, role: 'admin' });
  console.log(`Admin created: ${email}`);
} else console.log(`Admin already exists: ${email}`);

console.log(`Seeded ${menu.length} menu items and ${gallery.length} gallery images.`);
await mongoose.disconnect();
