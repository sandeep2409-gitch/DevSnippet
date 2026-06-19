# Day 27: Premium Code Snippet Manager

Welcome to **DevSnippet**, a high-fidelity Code Snippet Manager built as part of the 30 Days Web Development Challenge. DevSnippet helps developers catalog, search, and copy code snippets in a modern dark-theme dashboard with custom syntax highlighting and real-time database mode indicators.

---

## ⚡ Tech Stack

- **Frontend:** React (Vite SPA)
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose) with an **automatic, local JSON file fallback** if MongoDB is offline.
- **Styling:** Vanilla CSS (Tailored HSL variables, ambient glow effects, responsive flex/grid, and frosted glassmorphism overlays)
- **Icons:** `lucide-react`
- **Syntax Highlighting:** `react-syntax-highlighter` (Prism Engine with `atomDark` styling theme)

---

## 🎯 Key Features

1. **Dashboard Stats Panel:** Real-time indicator displaying the database connection mode (MongoDB vs. JSON file fallback), total snippet counts, and pinned counts.
2. **Library Filters:** Easy navigation sidebar to toggle between all snippets, pinned items, language filters, and popular tag badges.
3. **Advanced Global Search:** Instant fuzzy match search looking through titles, descriptions, code bodies, and tags simultaneously.
4. **Syntax Highlighting:** Premium code block renderer supporting multi-language highlights with line numbers and toggleable expand/collapse views for long files.
5. **One-Click Clipboard copy:** Animated Copy button that switches to a green checkmark icon to confirm the code was captured.
6. **Robust Offline Mode:** Out-of-the-box utility that automatically saves data to `server/db.json` if a local MongoDB server is not running or fails to respond within 2.5 seconds.
7. **CRUD Actions:** Create new snippets, edit existing fields, toggle pin states, and delete old blocks with custom dialogues.

---

## 📁 Directory Structure

```
DAY27 -- CODE SNIPPET MANAGER/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     
│   │   │   ├── Sidebar.jsx     # Navigation and active filter categories
│   │   │   ├── SnippetCard.jsx # Code highlighter block & clipboard actions
│   │   │   ├── SnippetForm.jsx # Create/Edit validation modal
│   │   │   └── Stats.jsx       # Stats ribbon & database state indicator
│   │   ├── App.jsx         # API state engine and grid assembler
│   │   ├── index.css       # Design system style sheets
│   │   └── main.jsx        # App bootstrapper
│   ├── index.html          # HTML Shell with Google Outfit & Fira Code fonts
│   ├── package.json        # Frontend config and dependencies
│   └── vite.config.js      # Proxy settings routing `/api` to port 5000
└── server/                 # Express backend REST APIs
    ├── db.json             # Local database fallback (created on startup if MongoDB fails)
    ├── server.js           # Express routers, mongoose adapters, and filesystem DB interfaces
    ├── test-api.js         # Integration test suite validating backend CRUD
    └── package.json        # Server configuration and dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed (v20.0.0 or higher recommended)
- (Optional) MongoDB running locally on default port `27017`

### 1. Launch the Backend Server
Navigate to the server directory, install dependencies, and start the node process:
```bash
cd server
npm install
npm start
```
*Note: If MongoDB is not running, you will see a warning in the console, and the server will gracefully initialize a persistent database inside `server/db.json` with three starter snippets.*

### 2. Launch the Frontend Client
Open a new terminal window, navigate to the client directory, install dependencies, and start the Vite server:
```bash
cd client
npm install
npm run dev
```

Open your browser to `http://localhost:5173` to explore the application!

---

## 🧪 Integration Testing
To run the automated endpoint validation suite:
```bash
cd server
node test-api.js
```
This tests snippet fetching, stats aggregation, search filtering, update pinning, and record deletion directly against the Express port.
