# Hosting Guide for DevSnippet (React + Node.js + MongoDB)

Since DevSnippet utilizes a React frontend (Vite) and an Express API server with MongoDB, you need a hosting plan that supports both static assets and persistent server runtimes, along with a database cluster.

This guide covers:
1. **Database Setup:** Setting up a free cloud database on MongoDB Atlas.
2. **Deployment Option 1 (Unified):** Building the frontend and serving it directly via the Node.js server (e.g., on Render or Railway).
3. **Deployment Option 2 (Decoupled):** Hosting the frontend on Vercel/Netlify and the backend on Render/Railway.

---

## ☁️ Step 1: Set Up MongoDB Atlas (Free Cloud Database)

Since local MongoDB instances are not reachable from the web, you must migrate from `db.json` to a cloud-hosted database.

1. Go to [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) and sign up for a free account.
2. Create a new project and build a **M0 Free Tier Cluster** (shared).
3. Under **Security > Database Access**, create a user with a username and a strong password (select "Read and write to any database").
4. Under **Security > Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) so your hosting provider can connect.
5. Go to your cluster Dashboard, click **Connect**, choose **Drivers**, and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
   *Replace `<username>` and `<password>` with your database user details.*

---

## 📦 Option 1: Unified Hosting (Easiest - Single Web Service)

In this configuration, we compile the React frontend into static assets and instruct the Express backend to serve them. This allows you to host the entire application under a single Render or Railway Web Service for free.

### 1. Update the Server Code
To enable static asset delivery in production, add the following code block to [server.js](file:///Users/pandu/MY%20PROJECTS/WEB%20DEVELOPMENT/30%20DAYS%20CHALLENGE/DAY27%20--%20CODE%20SNIPPET%20MANAGER/server/server.js) right before `app.listen(...)`:

```javascript
// Serve React static build files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  
  // All other GET requests route to React's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
```

### 2. Configure Render Web Service
1. Push your workspace to GitHub.
2. Log in to [Render](https://render.com/) and click **New > Web Service**.
3. Link your GitHub repository.
4. Set the following parameters:
   - **Root Directory:** `DAY27 -- CODE SNIPPET MANAGER`
   - **Runtime:** `Node`
   - **Build Command:** `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command:** `cd server && npm start`
5. Go to the **Environment** tab and add your variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `mongodb+srv://... (your Atlas connection string)`
   - `PORT`: `5000`
6. Click **Deploy Web Service**.

---

## ⚡ Option 2: Decoupled Hosting (Vercel Frontend + Render Backend)

Decoupling is recommended for large applications because the React frontend is deployed to a high-speed CDN edge network, making page loads incredibly fast.

### 1. Backend Service (Render or Railway)
Deploy the server folder using the steps from Option 1, but with these adjustments:
- **Build Command:** `npm install` (since you only need server packages).
- **Start Command:** `npm start`.
- Note down your backend URL (e.g. `https://devsnippet-api.onrender.com`).

### 2. Update Frontend API Endpoint
By default, the Vite dev server uses `/api` proxying. In production, we need the client to query your Render backend directly.

Update [App.jsx](file:///Users/pandu/MY%20PROJECTS/WEB%20DEVELOPMENT/30%20DAYS%20CHALLENGE/DAY27%20--%20CODE%20SNIPPET%20MANAGER/client/src/App.jsx)'s API URL configuration:
```javascript
// Find: let url = '/api/snippets';
// Change to check for environment variables:
const API_BASE = import.meta.env.VITE_API_URL || '';
let url = `${API_BASE}/api/snippets`;
```
Also update the stats URL:
```javascript
// Find: const resStats = await fetch('/api/snippets/stats');
// Change to:
const resStats = await fetch(`${API_BASE}/api/snippets/stats`);
```

### 3. Deploy Frontend on Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. In the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `DAY27 -- CODE SNIPPET MANAGER/client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand the **Environment Variables** section and add:
   - `VITE_API_URL`: `https://your-backend-service-url.onrender.com` (no trailing slash)
5. Click **Deploy**. Vercel will build your static files and deploy them globally.
