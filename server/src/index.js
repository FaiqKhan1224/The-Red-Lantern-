import './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';
import { mailMode } from './config/mailer.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env (project root) and set it.');
  process.exit(1);
}

connectDB().then(async () => {
  console.log(mailMode() === 'smtp' ? 'Email: SMTP configured' : 'Email: SMTP not configured - emails will be printed in this terminal');
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`The Red Lantern API running on http://localhost:${port}`));
}).catch(() => process.exit(1));
