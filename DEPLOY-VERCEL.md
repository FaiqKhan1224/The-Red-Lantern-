# Deploy to Vercel (one project: React + Express together)

```
https://your-project.vercel.app/        -> React/Vite site  (client/dist)
https://your-project.vercel.app/api/... -> Express API      (api/index.js -> server/src/app.js)
```

The site calls `/api/...` on its own domain, so there is **no separate backend URL** and you
create **only one** Vercel project.

## 1. Database (MongoDB Atlas)
1. Create a free cluster, then a database user (username + password).
2. Network Access -> allow `0.0.0.0/0` (Vercel uses changing IPs).
3. Copy the connection string and add a database name, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/red_lantern`

## 2. Seed once from your computer
```
npm run install:all
copy .env.example .env        (Windows PowerShell;  macOS/Linux: cp .env.example .env)
# edit .env: MONGO_URI (the Atlas string), JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed
```
This fills the menu, gallery and settings and creates the admin account.

## 3. Push to GitHub and import into Vercel
1. Push this folder to a GitHub repository (`.env` is git-ignored, so secrets are not uploaded).
2. Vercel -> **Add New -> Project** -> import the repo. Keep **Root Directory** = the folder that contains `vercel.json`.
3. Leave **Framework Preset = Other**. Do not change the build settings: `vercel.json` already sets
   install command, build command (`npm run build --prefix client`) and output directory (`client/dist`).

## 4. Environment variables (Project -> Settings -> Environment Variables)
| Name | Required | Notes |
|---|---|---|
| `MONGO_URI` | **Yes** | Atlas connection string including the database name |
| `JWT_SECRET` | **Yes** | Long random string, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Optional | Reservation emails. Without them emails are only logged and the site still works |

Not needed on Vercel: `CLIENT_URL`, `PORT`, `VITE_API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (the last two are only used by `npm run seed` on your computer).
Add them for Production (and Preview if you use previews), then **redeploy** so they take effect.

## 5. Deploy and check
1. Click **Deploy**.
2. Open `https://your-project.vercel.app/api/health` -> `{"ok":true}`
3. Open `https://your-project.vercel.app/api/menu` -> JSON menu (this proves the database connection).
4. Open the site, sign in with the admin account, make a test reservation.

## Troubleshooting
- `/api/menu` says "missing JWT_SECRET" or "MONGO_URI is not set": add the variable, then redeploy.
- `/api/menu` says "Database unavailable": check the Atlas password (URL-encode special characters) and the `0.0.0.0/0` network rule.
- Refreshing a page like `/dining` works because `vercel.json` rewrites non-API paths to `index.html`.

## Local development
```
npm run install:all
npm run seed
npm run dev        # API http://localhost:5000, site http://localhost:5173
```
