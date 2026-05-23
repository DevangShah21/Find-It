# Find-It 🔍

Full-stack Lost & Found platform — **React + Vite** frontend, **Express.js** backend, **MongoDB** database.

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017` (or update `.env`)

### 1. Install dependencies
```bash
# From findit/ root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment
Edit `backend/.env`:
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/findit
JWT_SECRET=findit_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
```

### 3. Seed the database
```bash
cd backend
npm run seed
```
This creates:
- 👑 **Admin** → `admin@findit.com` / `admin123`
- 👤 **User**  → `user@findit.com`  / `user1234`
- 8 sample items

### 4. Run both servers

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev   # http://localhost:3001
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev  # http://localhost:5173
```

Open **http://localhost:5173**

---

## Features

### Authentication
- JWT-based sign in / sign up
- Protected routes (React + backend middleware)
- Roles: `user` and `admin`

### User Panel (`/dashboard`)
- View all own reported items
- Filter by lost / found
- Stats overview

### Admin Panel (`/admin`)
- Platform-wide stats dashboard
- **Manage Items** — view all, filter, delete any item
- **Manage Users** — change roles, activate/deactivate, delete users
- Delete button visible only to admins on item cards

### Item Delete Authority
- Only admins can delete items (enforced on both frontend and backend)
- Backend: `DELETE /api/items/:id` requires `protect` + `adminOnly` middleware
- Frontend: delete button only renders for admin users
- Admin panel has its own dedicated items management table

---

## API Endpoints

### Auth
| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/signin` | Public |
| GET  | `/api/auth/me` | Auth |
| PATCH | `/api/auth/me` | Auth |

### Items
| Method | Path | Access |
|--------|------|--------|
| GET | `/api/items` | Public |
| GET | `/api/items/my` | Auth |
| POST | `/api/items` | Auth |
| PATCH | `/api/items/:id/claim` | Auth |
| DELETE | `/api/items/:id` | **Admin Only** |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Platform stats |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id/role` | Change role |
| PATCH | `/api/admin/users/:id/toggle` | Activate/deactivate |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/items` | All items |
| DELETE | `/api/admin/items/:id` | Delete item |

---

## Project Structure

```
findit/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── middleware/auth.js       # protect, adminOnly, optionalAuth
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt + roles)
│   │   └── Item.js             # Item schema
│   ├── routes/
│   │   ├── auth.js             # signin, signup, me
│   │   ├── items.js            # CRUD + admin delete
│   │   └── admin.js            # Admin-only routes
│   ├── scripts/seed.js         # DB seeder
│   ├── server.js
│   └── .env
│
└── frontend/
    └── src/
        ├── context/AuthContext.jsx     # Global auth state
        ├── components/
        │   ├── Navbar.jsx              # With user dropdown
        │   ├── ItemCard.jsx            # With admin delete button
        │   ├── ItemModal.jsx
        │   └── ProtectedRoute.jsx      # Route guards
        ├── pages/
        │   ├── auth/SignIn.jsx
        │   ├── auth/SignUp.jsx
        │   ├── UserDashboard.jsx
        │   ├── admin/AdminPanel.jsx    # Full admin panel
        │   ├── Home.jsx
        │   ├── LostItems.jsx
        │   ├── FoundItems.jsx
        │   ├── ReportItem.jsx
        │   └── About.jsx
        └── styles/main.css
```
