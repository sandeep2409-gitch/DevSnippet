const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/snippet-manager';
const DB_FILE_PATH = path.join(__dirname, 'db.json');

let useFallbackDb = false;

// ----------------------------------------------------
// Starter snippets for fallback database (and DB init)
// ----------------------------------------------------
const starterSnippets = [
  {
    id: "starter-1",
    title: "React Dark Mode Hook",
    code: `import { useState, useEffect } from 'react';\n\nexport function useDarkMode() {\n  const [darkMode, setDarkMode] = useState(() => {\n    return localStorage.getItem('theme') === 'dark' ||\n      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);\n  });\n\n  useEffect(() => {\n    const root = window.document.documentElement;\n    if (darkMode) {\n      root.classList.add('dark');\n      localStorage.setItem('theme', 'dark');\n    } else {\n      root.classList.remove('dark');\n      localStorage.setItem('theme', 'light');\n    }\n  }, [darkMode]);\n\n  return [darkMode, setDarkMode];\n}`,
    language: "javascript",
    description: "A custom React hook that manages dark mode toggle state, persists it to local storage, and syncs with system preferences.",
    tags: ["react", "hooks", "theme", "dark-mode"],
    pinned: true,
    createdAt: new Date(Date.now() - 100000).toISOString()
  },
  {
    id: "starter-2",
    title: "Sleek Glassmorphism CSS Cards",
    code: `.glass-card {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 16px;\n  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);\n  padding: 1.5rem;\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.glass-card:hover {\n  background: rgba(255, 255, 255, 0.08);\n  border-color: rgba(255, 255, 255, 0.2);\n  transform: translateY(-4px);\n}`,
    language: "css",
    description: "Premium visual style tokens using CSS backdrop-filter and transparency for a modern frosted-glass overlay look.",
    tags: ["css", "styling", "glassmorphism", "ui"],
    pinned: true,
    createdAt: new Date(Date.now() - 50000).toISOString()
  },
  {
    id: "starter-3",
    title: "Python Quicksort Implementation",
    code: `def quicksort(arr):\n    if len(arr) <= 1:\n      return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)\n\n# Example usage:\nprint(quicksort([3, 6, 8, 10, 1, 2, 1]))\n# Output: [1, 1, 2, 3, 6, 8, 10]`,
    language: "python",
    description: "A standard recursive quicksort implementation in Python using list comprehensions for concise readability.",
    tags: ["python", "algorithms", "sorting"],
    pinned: false,
    createdAt: new Date(Date.now() - 10000).toISOString()
  }
];

// Helper to initialize JSON DB
const initJsonDb = () => {
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(starterSnippets, null, 2));
    console.log("Initialized local JSON database with starter snippets.");
  }
};

// ----------------------------------------------------
// MongoDB Schema definition
// ----------------------------------------------------
const snippetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  description: { type: String, default: '' },
  tags: { type: [String], default: [] },
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Snippet = mongoose.model('Snippet', snippetSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 8000 // 8 seconds to allow remote MongoDB Atlas connections
}).then(() => {
  console.log("Connected to MongoDB successfully!");
}).catch(err => {
  console.warn("\n====================================================================");
  console.warn("WARNING: Could not connect to MongoDB (is MongoDB running locally?)");
  console.warn("Express server will fall back to using Local JSON database: server/db.json");
  console.warn("====================================================================\n");
  useFallbackDb = true;
  initJsonDb();
});

// ----------------------------------------------------
// Database Adapter Functions
// ----------------------------------------------------
async function getAllDbSnippets() {
  if (useFallbackDb) {
    try {
      initJsonDb();
      const rawData = fs.readFileSync(DB_FILE_PATH, 'utf8');
      return JSON.parse(rawData);
    } catch (e) {
      console.error("Error reading JSON DB", e);
      return [];
    }
  } else {
    return await Snippet.find().sort({ createdAt: -1 });
  }
}

async function writeDbSnippets(snippets) {
  if (useFallbackDb) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(snippets, null, 2));
    return snippets;
  }
}

async function createSnippet(data) {
  if (useFallbackDb) {
    const snippets = await getAllDbSnippets();
    const newSnippet = {
      id: Date.now().toString(),
      title: data.title,
      code: data.code,
      language: data.language,
      description: data.description || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      pinned: data.pinned || false,
      createdAt: new Date().toISOString()
    };
    snippets.unshift(newSnippet);
    await writeDbSnippets(snippets);
    return newSnippet;
  } else {
    const newSnippet = new Snippet(data);
    return await newSnippet.save();
  }
}

async function updateSnippetById(id, data) {
  if (useFallbackDb) {
    const snippets = await getAllDbSnippets();
    const idx = snippets.findIndex(s => s.id === id || s._id === id);
    if (idx === -1) return null;
    
    snippets[idx] = {
      ...snippets[idx],
      title: data.title !== undefined ? data.title : snippets[idx].title,
      code: data.code !== undefined ? data.code : snippets[idx].code,
      language: data.language !== undefined ? data.language : snippets[idx].language,
      description: data.description !== undefined ? data.description : snippets[idx].description,
      tags: data.tags !== undefined ? data.tags : snippets[idx].tags,
      pinned: data.pinned !== undefined ? data.pinned : snippets[idx].pinned
    };
    await writeDbSnippets(snippets);
    return snippets[idx];
  } else {
    return await Snippet.findByIdAndUpdate(id, data, { new: true });
  }
}

async function deleteSnippetById(id) {
  if (useFallbackDb) {
    const snippets = await getAllDbSnippets();
    const idx = snippets.findIndex(s => s.id === id || s._id === id);
    if (idx === -1) return false;
    snippets.splice(idx, 1);
    await writeDbSnippets(snippets);
    return true;
  } else {
    const res = await Snippet.findByIdAndDelete(id);
    return !!res;
  }
}

// ----------------------------------------------------
// API Route Handlers
// ----------------------------------------------------

// Get all snippets (supports search filters)
app.get('/api/snippets', async (req, res) => {
  try {
    const { q, lang, tag, pinnedOnly } = req.query;
    let snippets = await getAllDbSnippets();

    // Filter by Pinned
    if (pinnedOnly === 'true') {
      snippets = snippets.filter(s => s.pinned);
    }

    // Filter by Language
    if (lang) {
      snippets = snippets.filter(s => s.language.toLowerCase() === lang.toLowerCase());
    }

    // Filter by Tag
    if (tag) {
      snippets = snippets.filter(s => 
        s.tags && s.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }

    // Filter by text search query q (searches title, description, code, tags)
    if (q) {
      const query = q.toLowerCase();
      snippets = snippets.filter(s => {
        const titleMatch = s.title?.toLowerCase().includes(query);
        const descMatch = s.description?.toLowerCase().includes(query);
        const codeMatch = s.code?.toLowerCase().includes(query);
        const tagMatch = s.tags?.some(t => t.toLowerCase().includes(query));
        return titleMatch || descMatch || codeMatch || tagMatch;
      });
    }

    res.json(snippets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch snippets", details: err.message });
  }
});

// Get database statistics for the dashboard
app.get('/api/snippets/stats', async (req, res) => {
  try {
    const snippets = await getAllDbSnippets();
    const totalCount = snippets.length;
    const pinnedCount = snippets.filter(s => s.pinned).length;

    // Count by Language
    const languageCounts = {};
    // Track unique tags
    const tagCounts = {};

    snippets.forEach(s => {
      // Language count
      const lang = s.language ? s.language.toLowerCase() : 'other';
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;

      // Tag counts
      if (s.tags && Array.isArray(s.tags)) {
        s.tags.forEach(t => {
          const cleanTag = t.trim().toLowerCase();
          if (cleanTag) {
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          }
        });
      }
    });

    // Sort tags by frequency and return top 8
    const topTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      totalCount,
      pinnedCount,
      languageCounts,
      topTags,
      dbMode: useFallbackDb ? 'JSON Fallback File' : 'MongoDB'
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate stats", details: err.message });
  }
});

// Create snippet
app.post('/api/snippets', async (req, res) => {
  try {
    const { title, code, language, description, tags, pinned } = req.body;
    if (!title || !code || !language) {
      return res.status(400).json({ error: "Title, code content, and language are required fields." });
    }

    const processedTags = tags && Array.isArray(tags) 
      ? tags.map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const newSnippet = await createSnippet({
      title,
      code,
      language,
      description: description || '',
      tags: processedTags,
      pinned: pinned || false
    });

    res.status(201).json(newSnippet);
  } catch (err) {
    res.status(500).json({ error: "Failed to create snippet", details: err.message });
  }
});

// Update snippet
app.put('/api/snippets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code, language, description, tags, pinned } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (code !== undefined) updateData.code = code;
    if (language !== undefined) updateData.language = language;
    if (description !== undefined) updateData.description = description;
    if (pinned !== undefined) updateData.pinned = pinned;
    if (tags !== undefined && Array.isArray(tags)) {
      updateData.tags = tags.map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    const updated = await updateSnippetById(id, updateData);
    if (!updated) {
      return res.status(404).json({ error: "Snippet not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update snippet", details: err.message });
  }
});

// Delete snippet
app.delete('/api/snippets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteSnippetById(id);
    if (!success) {
      return res.status(404).json({ error: "Snippet not found" });
    }
    res.json({ message: "Snippet deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete snippet", details: err.message });
  }
});

// Serve React static build files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  
  // All other GET requests route to React's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start listening
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
