# LawMate — Full-Stack Legal Case Management System

## 📁 Folder Structure
```
lawmate/
├── backend/                  ← Node.js + Express API
│   ├── config/
│   │   └── supabase.js       ← Supabase client (service role)
│   ├── middleware/
│   │   └── auth.js           ← JWT auth + role guard
│   ├── routes/
│   │   ├── auth.js           ← Register, Login, /me, Profile
│   │   ├── cases.js          ← Case CRUD + client notifications
│   │   ├── hearings.js       ← Hearings CRUD + client notifications
│   │   ├── documents.js      ← File upload to Supabase Storage
│   │   ├── clients.js        ← Approve/reject clients (lawyer)
│   │   ├── fees.js           ← Fee records + client notifications
│   │   ├── tasks.js          ← Lawyer task management
│   │   └── notifications.js  ← Notification read/mark-all
│   ├── server.js             ← Express app entry point
│   ├── package.json
│   └── .env.example          ← Copy to .env and fill in values
│
├── frontend/                 ← Static HTML/CSS/JS
│   ├── js/
│   │   └── api.js            ← Shared API helper + Auth + utilities
│   ├── index.html            ← Public landing page
│   ├── login.html            ← Login (client + lawyer)
│   ├── register.html         ← Register (client + lawyer)
│   ├── client/
│   │   ├── shared.css
│   │   ├── _sidebar.js       ← Dynamic sidebar (auto-injected)
│   │   ├── dashboard.html
│   │   ├── cases.html
│   │   ├── hearings.html
│   │   ├── documents.html
│   │   ├── fee-status.html
│   │   └── profile.html
│   └── lawyer/
│       ├── shared.css
│       ├── _sidebar.js
│       ├── dashboard.html
│       ├── clients.html
│       ├── cases.html
│       ├── hearings.html
│       ├── documents.html
│       ├── tasks.html
│       ├── fee-records.html
│       └── profile.html
│
└── database/
    └── schema.sql            ← Run this in Supabase SQL Editor
```

---

## 🚀 Setup Guide (Step by Step)

### STEP 1 — Create a Supabase Project
1. Go to https://supabase.com and create a free account
2. Click **New Project**, name it `lawmate`, choose a region
3. Wait ~2 minutes for it to spin up
4. Go to **Settings → API** and note:
   - `Project URL`  → `SUPABASE_URL`
   - `service_role` key (secret) → `SUPABASE_SERVICE_KEY`

### STEP 2 — Run the Database Schema
1. In Supabase dashboard → **SQL Editor → New Query**
2. Copy the entire contents of `database/schema.sql`
3. Paste it and click **Run**
4. You should see all 7 tables created with no errors

### STEP 3 — Create a Supabase Storage Bucket
1. In Supabase dashboard → **Storage → New Bucket**
2. Name: `lawmate-documents`
3. Check **Public bucket** (so download URLs work)
4. Click **Create bucket**

### STEP 4 — Configure the Backend
```bash
cd backend

# Copy the example env file
cp .env.example .env
```
v` and fill in:
```
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=pick_any_random_long_string_at_least_32_chars
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:5000
STORAGE_BUCKET=lawmate-documents
```

### STEP 5 — Install Dependencies & Start Server
```bash
cd backend
npm install
npm run dev    # development (auto-restart with nodemon)
# or
npm start      # production
```
The server starts at **http://localhost:5000**

The server also serves the `frontend/` folder as static files, so everything runs from **one port**.

### STEP 6 — Open the App
Visit **http://localhost:5000**

---

## 🔄 Data Flow & Real-Time Sync

| Lawyer Action | What Happens on Client Side |
|---|---|
| Creates a case with client assigned | Client sees it on Dashboard + Cases page immediately |
| Schedules a hearing | Client gets a notification + hearing appears on Hearings page |
| Uploads a document | Client gets a notification + file appears on Documents page with Download button |
| Updates case status + plain English description | Client sees updated progress bar + new description on Cases page |
| Adds/updates fee record | Client gets a notification + fee card updates on Fee Status page |
| Approves client account | Client gets a notification; they can now log in and see their data |

All sync happens via the shared Supabase database — no polling needed. Every API call fetches fresh data.

---

## 🔐 Auth Flow

```
Register → JWT token issued → stored in localStorage
Login    → JWT token issued → stored in localStorage
Every API call → sends  Authorization: Bearer <token>
Backend  → verifies JWT → identifies user ID + role
Role guards → lawyer routes reject client tokens (403)
```

**Client login** redirects to `/client/dashboard.html`
**Lawyer login** redirects to `/lawyer/dashboard.html`

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | None | Register client or lawyer |
| POST | /api/auth/login | None | Login, get JWT |
| GET | /api/auth/me | Any | Get current user profile |
| PUT | /api/auth/profile | Any | Update own profile |
| GET | /api/cases | Any | Get cases (filtered by role) |
| POST | /api/cases | Lawyer | Create case |
| PUT | /api/cases/:id | Lawyer | Update case + notify client |
| DELETE | /api/cases/:id | Lawyer | Delete case |
| GET | /api/hearings | Any | Get hearings (filtered by role) |
| POST | /api/hearings | Lawyer | Schedule hearing + notify client |
| PUT | /api/hearings/:id | Lawyer | Update hearing |
| DELETE | /api/hearings/:id | Lawyer | Delete hearing |
| GET | /api/documents | Any | Get documents (filtered by role) |
| POST | /api/documents/upload | Lawyer | Upload file to Supabase Storage + notify client |
| DELETE | /api/documents/:id | Lawyer | Delete document |
| GET | /api/clients | Lawyer | List all clients |
| PUT | /api/clients/:id/approve | Lawyer | Approve client |
| PUT | /api/clients/:id/reject | Lawyer | Reject client |
| GET | /api/fees | Any | Get fee records (filtered by role) |
| POST | /api/fees | Lawyer | Create fee record + notify client |
| PUT | /api/fees/:id | Lawyer | Update payment + notify client |
| GET | /api/tasks | Lawyer | Get lawyer's tasks |
| POST | /api/tasks | Lawyer | Create task |
| PUT | /api/tasks/:id | Lawyer | Update task status |
| DELETE | /api/tasks/:id | Lawyer | Delete task |
| GET | /api/notifications | Any | Get notifications for current user |
| PUT | /api/notifications/:id/read | Any | Mark notification read |
| PUT | /api/notifications/read-all | Any | Mark all as read |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |
| File Storage | Supabase Storage |
| File Upload | Multer (memory storage) |

---

## 🧪 Test Credentials (after running schema.sql)

Register a new **lawyer** account at `/register.html` → select Lawyer tab
Register a new **client** account at `/register.html` → select Client tab

Then log in as the lawyer, go to **Clients** and approve the client.
Then go to **Cases** and create a case assigned to that client.

You'll see the case appear on the client's dashboard automatically.
