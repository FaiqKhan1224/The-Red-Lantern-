# The Red Lantern — Luxury Chinese Restaurant Web App

React + Vite front end, Node/Express + MongoDB back end. Seven art-directed pages, reservations, private-dining enquiries, a contact form, a gallery with lightbox, and a staff admin dashboard. Passwords are hidden by default with an eye button to show/hide.

## 1. What you need installed (once)

1. **Node.js 18 or newer** — https://nodejs.org (check with `node -v`)
2. **MongoDB** — pick ONE:
   - **Local:** install MongoDB Community Server (https://www.mongodb.com/try/download/community) and leave "Install as a Service" ticked. It then runs automatically.
   - **Cloud (no install):** create a free cluster on MongoDB Atlas, copy its connection string, and paste it as `MONGO_URI` in `.env`.

## 2. Install and run (VS Code, PowerShell)

Open the `red-lantern` folder in VS Code, then open a terminal (**Terminal → New Terminal**) and run:

```powershell
npm run install:all
npm run seed
npm run dev
```

- `install:all` installs the root, server and client packages (takes a minute or two).
- `seed` fills the database with the menu, gallery, restaurant details and creates the admin account.
- `dev` starts the API on **http://localhost:5000** and the website on **http://localhost:5173**.

Open **http://localhost:5173** in your browser.

Copy `.env.example` to `.env` in the project root (same folder as this README) and set `MONGO_URI` and `JWT_SECRET` before `npm run seed` / `npm run dev`.

## 3. Admin dashboard

1. Go to **Sign in** (top right) → use the admin account:
   - Email: `admin@redlantern.com`
   - Password: `ChangeMe@12345`
2. You land on **Admin → Reservations** (`/admin/reservations`). The **Menu & Content** page (`/admin`) lets you edit the menu and prices, add or delete gallery images, handle event enquiries and contact messages, and edit address, phone, email, social links and opening hours.

**Change the admin password** before going live: edit `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, delete the `users` collection (or the database), and run `npm run seed` again.

Guests can also create an account (**Sign in → Create an account**) to prefill and track reservations. Making a reservation does not require an account.

## 4. Images, logo and icons

- Page photos live in `client/public/images/` (home, story, dining, gallery, private, reservations, contact). `client/src/lib/images.js` maps them to pages, lists the smaller phone-sized copies, and sets each photo's focal point for desktop and mobile (`FOCUS`).
- Logo and icon files live in `client/public/brand/`; favicons / app icons are in `client/public/`.
- Only the Chef portrait and the three signature-dish photos (plus the menu/gallery items created by `npm run seed`) still load from Unsplash, because no replacement images were supplied. Swap them in `images.js`, or in the admin dashboard for menu and gallery items.

## 5. Project layout

```
server/
  src/app.js            Express app (used locally AND by Vercel)
  src/index.js          Local server start-up (not used on Vercel)
api/index.js            Vercel serverless entry -> server/src/app.js
vercel.json             One-project config: client build + /api routing
  src/models/index.js   User, Reservation, MenuItem, GalleryImage,
                        EventEnquiry, ContactMessage, RestaurantSettings
  src/routes/           auth, reservations, menu/gallery/enquiries/contact/settings
  src/middleware/auth.js  JWT + admin guard
  src/seed.js           sample data + admin user
client/
  src/pages/            Home, Story, Dining, Gallery, Private, Reservations, Contact, Login
  src/admin/Admin.jsx   staff dashboard
  src/components/       Layout (nav/footer), ui (PasswordInput, Seo, Reveal), Lightbox
  src/styles.css        design system (ink / ivory / vermilion / gold)
```

## 6. API summary

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | signed in |
| POST | `/api/reservations` | public |
| GET | `/api/reservations/mine` | signed in |
| GET | `/api/reservations`, `/api/reservations/summary` | admin |
| PATCH | `/api/reservations/:id` (`action`: confirm, reject, cancel, update, complete, message) | admin |
| DELETE | `/api/reservations/:id` | admin |
| GET | `/api/menu`, `/api/gallery`, `/api/settings` | public |
| POST / PUT / DELETE | `/api/menu`, `/api/gallery`, `PUT /api/settings` | admin |
| POST | `/api/enquiries`, `/api/contact` | public |
| GET / PUT / DELETE | `/api/enquiries`, `/api/contact` | admin |

## 7. Troubleshooting

- **"Could not connect to MongoDB"** — MongoDB is not running. Start the MongoDB service, or use an Atlas URI in `server/.env`.
- **Port already in use** — change `PORT` in `server/.env` and the proxy target in `client/vite.config.js`.
- **Menu / gallery empty** — run `npm run seed`.
- **"Cannot reach the server"** — make sure `npm run dev` is still running and shows both `server` and `client`.

## 8. Production build

```powershell
npm run build --prefix client
```
Host `client/dist` on any static host, run `npm start --prefix server` on a Node host, and set `VITE_API_URL` (client) and `CLIENT_URL` (server) to your real URLs. Use a strong `JWT_SECRET` and change the admin password.

## 9. Reservation emails, My Reservations and admin Reservations

### The flow
Reservation form → reservation created → confirmation email (status Pending) → appears in **My Reservations** (when signed in) → admin reviews → admin Confirms / Rejects / Cancels / Updates / Messages → guest is emailed → **My Reservations** updates by itself (every 15 seconds and whenever the tab is refocused).

This applies to all three reservation types (Dining Room, Private Dining, Chef's Experience). Private Dining *event enquiries* are unchanged.

### Setting up real email (SMTP)
Add to `server/.env` (copy from `.env.example`):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-address@gmail.com
SMTP_PASS=your-16-character-app-password
MAIL_FROM="The Red Lantern" <your-address@gmail.com>
```
For Gmail: Google Account → Security → turn on **2-Step Verification** → **App passwords** → create one and paste it as `SMTP_PASS` (your normal password will not work). Any SMTP provider works. Restart `npm run dev` after editing `.env`.

Without SMTP settings, emails are printed in the server terminal instead of sent (fine for testing, not for going live).

### Emails sent to the address the guest entered
Request received · confirmed · rejected · cancelled · date/time/guests updated (changes highlighted) · completed · a plain message from the restaurant. Any note the admin writes is included in the email and shown on the guest's dashboard.

### My Reservations (`/my-reservations`)
Shows reference, type, date, time, guests, details, status (Pending, Confirmed, Rejected, Cancelled, Completed), the latest admin message and the update history. Reservations made **while signed in** appear here. A booking made as a guest is not linked to any account, because email addresses are not verified.

### Admin → Reservations (`/admin/reservations`)
Tabs: Pending, Upcoming, Confirmed, Rejected, Cancelled, Completed, Past, All (live counts). Search by name, email, phone or reservation ID; filter by date and type. Click a reservation to see everything and to confirm, reject, cancel, edit date/time/guests, add a message, send a message only, or mark completed. Impossible changes are blocked. If an email fails to send, the change is still saved and the admin is told.

### Upgrading an existing database
Run `npm install --prefix server` once. Old reservations with the status `approved` become `confirmed` automatically at server start.
