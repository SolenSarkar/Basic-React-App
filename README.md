# 📦 MERN App — Items CRUD

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing a list of items with full **CRUD** functionality, **search**, and **pagination**.

## ✨ Features

- **Backend (Express + MongoDB)**
  - RESTful API with `GET`, `POST`, `PUT`, `DELETE` endpoints
  - Search by name/description (case-insensitive)
  - Pagination with configurable `page` and `limit` (clamped 1–100)
  - Input & ObjectId validation returning proper `400` responses
  - Graceful shutdown on `Ctrl+C`
  - Seed script to populate sample data

- **Frontend (React + Vite)**
  - Add, edit, and delete items with a polished UI
  - Search bar + clear search
  - Pagination controls
  - Client-side form validation with inline error messages
  - Delete confirmation dialog
  - Auto-dismissing toast notifications for success/error feedback
  - Loading & empty states
  - Responsive design

## 🛠️ Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React 18, Vite, CSS                 |
| Backend    | Node.js, Express                    |
| Database   | MongoDB Atlas (Mongoose ODM)        |
| Tooling    | concurrently (run server + client)  |

## 📁 Project Structure

```
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── App.jsx         # Main layout
│       ├── App.css         # Global styles
│       └── components/
│           └── ItemList.jsx  # CRUD UI, search, pagination
├── server/                 # Express backend
│   ├── index.js            # Server entry, DB connection
│   ├── seed.js             # Seed script
│   ├── models/
│   │   └── Item.js         # Mongoose model
│   └── routes/
│       └── items.js        # API routes (CRUD + search + pagination)
├── package.json            # Root scripts (concurrently)
└── README.md
```

## 🌐 Deploying to GitHub Pages

GitHub Pages hosts **static files only**, so the React frontend is what gets deployed. The Express + MongoDB backend must be hosted separately (e.g. on [Render](https://render.com) or [Railway](https://railway.app)) for the app's CRUD operations to work on the live site.

### One-time GitHub Pages setup (in the GitHub repo)

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set **Branch** to **`gh-pages`** and folder to **`/ (root)`**, then click **Save**.
4. Your site will be published at **`https://SolenSarkar.github.io/Basic-React-App/`**.

### How deployment works

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

1. Runs on every push to the `main` branch (or manually via the **Actions** tab).
2. Installs the client dependencies.
3. Builds the Vite app with the correct base path (`/Basic-React-App/`).
4. Publishes the built `client/dist` folder to the **`gh-pages`** branch.

After a successful run, the **`gh-pages`** branch is created/updated and GitHub Pages serves it.

### Wiring up the backend (optional but required for live CRUD)

The frontend reads the API URL from the `VITE_API_URL` environment variable:

- If set → requests go to that hosted backend (e.g. `https://my-api.onrender.com`).
- If unset → it falls back to `/api` (works in local dev through the Vite proxy).

To point the deployed frontend at a hosted backend:

1. Deploy the `server/` folder to a host like Render or Railway, set `MONGODB_URI` there, and note the public URL (e.g. `https://my-api.onrender.com`).
2. In the GitHub repo, go to **Settings → Secrets and variables → Actions**.
3. Add a **repository secret** named `VITE_API_URL` with your hosted API URL.
4. Push a new commit (or re-run the workflow) — the workflow injects the secret as `VITE_API_URL` during the build.

### Manual deploy (alternative)

From the `client/` folder, you can also deploy manually using the `gh-pages` package:

```bash
cd client
npm install
npm run deploy   # runs predeploy (build) then publishes client/dist to gh-pages
```

> Note: The `base` path in `client/vite.config.js` is set to `/Basic-React-App/` so all asset URLs resolve correctly under the repo's sub-path on GitHub Pages.

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- A **MongoDB Atlas** cluster (free tier works). Create one at [mongodb.com](https://www.mongodb.com/atlas)

### 1. Install Dependencies

From the project root, run:

```bash
npm run install-all
```

This installs dependencies for the root, `server/`, and `client/` folders.

### 2. Configure Environment Variables

Create a `.env` file inside the `server/` folder:

```bash
cd server
cp .env.example .env   # Windows: copy .env.example .env
```

Then open `server/.env` and set your MongoDB connection string:

```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
```

> ⚠️ Never commit your real `.env` file — it is already ignored via `.gitignore`.

### 3. (Optional) Seed Sample Data

To populate the database with sample items:

```bash
npm run seed
```

> Note: the root `package.json` doesn't include a `seed` script by default. You can either run `cd server && npm run seed` (if you add the script) or `node server/seed.js` from the root.

### 4. Run the App

From the project root:

```bash
npm run dev
```

This starts:
- **Backend** → `http://localhost:5000`
- **Frontend** → `http://localhost:3000`

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no extra CORS configuration is needed in development.

## 🔌 API Reference

Base URL: `http://localhost:5000`

| Method | Endpoint          | Description                                    | Query/Body                                      |
| ------ | ----------------- | ---------------------------------------------- | ----------------------------------------------- |
| GET    | `/`               | Health check & API overview                    | —                                               |
| GET    | `/api/items`      | List items (search + pagination)               | `?search=&page=&limit=`                         |
| GET    | `/api/items/:id`  | Fetch a single item                            | —                                               |
| POST   | `/api/items`      | Create an item                                 | Body: `{ "name", "description" }`               |
| PUT    | `/api/items/:id`  | Update an item                                 | Body: `{ "name", "description" }`               |
| DELETE | `/api/items/:id`  | Delete an item                                 | —                                               |

### Example Request

```bash
# List items with search and pagination
curl "http://localhost:5000/api/items?search=react&page=1&limit=5"

# Create an item
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"My Item","description":"A sample item"}'
```

## 📜 Scripts

| Command              | Description                                      |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Run backend & frontend concurrently              |
| `npm run server`     | Run only the backend (port 5000)                 |
| `npm run client`     | Run only the frontend dev server (port 3000)     |
| `npm run install-all`| Install root + server + client dependencies      |
| `node server/seed.js`| Seed the database with sample items              |

## 🧰 Troubleshooting  

- **MongoDB connection errors** — verify `MONGODB_URI` in `server/.env`, and that your Atlas IP allowlist includes your current IP.
- **SSL handshake issues on Windows** — the server already enables `tlsAllowInvalidCertificates` to handle this.
- **Port already in use** — change `PORT` in `server/.env` and the Vite port in `client/vite.config.js`.

