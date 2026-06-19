import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SnippetCard from './components/SnippetCard';
import SnippetForm from './components/SnippetForm';
import Stats from './components/Stats';
import { Search, Sparkles, FolderHeart, Terminal, X, Code2 } from 'lucide-react';

export default function App() {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const [snippets, setSnippets] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    pinnedCount: 0,
    languageCounts: {},
    topTags: [],
    dbMode: 'Connecting...'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState({ type: 'all' });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch snippets and statistics
  const fetchData = async (filter = activeFilter, query = searchQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      // Build API query URL based on active filters and search queries
      let url = `${API_BASE}/api/snippets`;
      const params = new URLSearchParams();

      if (query) {
        params.append('q', query);
      }
      
      if (filter.type === 'pinned') {
        params.append('pinnedOnly', 'true');
      } else if (filter.type === 'language') {
        params.append('lang', filter.val);
      } else if (filter.type === 'tag') {
        params.append('tag', filter.val);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Fetch snippets list
      const resSnippets = await fetch(url);
      if (!resSnippets.ok) throw new Error('Failed to load snippets.');
      const dataSnippets = await resSnippets.json();
      setSnippets(dataSnippets);

      // Fetch stats summary
      const resStats = await fetch(`${API_BASE}/api/snippets/stats`);
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch on filter or query change
  useEffect(() => {
    fetchData(activeFilter, searchQuery);
  }, [activeFilter, searchQuery]);

  // Handle Save (Create or Edit)
  const handleSaveSnippet = async (snippetData) => {
    try {
      let url = `${API_BASE}/api/snippets`;
      let method = 'POST';

      if (editingSnippet) {
        const id = editingSnippet._id || editingSnippet.id;
        url += `/${id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snippetData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save snippet.');
      }

      // Refresh list
      setIsFormOpen(false);
      setEditingSnippet(null);
      fetchData();
    } catch (err) {
      alert(`Error saving snippet: ${err.message}`);
    }
  };

  // Handle Delete
  const handleDeleteSnippet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/snippets/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete snippet.');
      
      fetchData();
    } catch (err) {
      alert(`Error deleting snippet: ${err.message}`);
    }
  };

  // Handle Toggle Pin
  const handleTogglePin = async (snippet) => {
    const id = snippet._id || snippet.id;
    try {
      const res = await fetch(`${API_BASE}/api/snippets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !snippet.pinned })
      });

      if (!res.ok) throw new Error('Failed to update pin state.');
      
      fetchData();
    } catch (err) {
      alert(`Error updating pin state: ${err.message}`);
    }
  };

  // Helper to open edit modal
  const handleEditClick = (snippet) => {
    setEditingSnippet(snippet);
    setIsFormOpen(true);
  };

  // Helper to open create modal
  const handleCreateClick = () => {
    setEditingSnippet(null);
    setIsFormOpen(true);
  };

  // Get active filter title
  const getFilterTitle = () => {
    switch (activeFilter.type) {
      case 'pinned':
        return 'Pinned Snippets';
      case 'language':
        return `${activeFilter.val.toUpperCase()} Snippets`;
      case 'tag':
        return `Tagged #${activeFilter.val}`;
      default:
        return 'All Snippets';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentFilter={activeFilter}
        setFilter={setActiveFilter}
        onAddClick={handleCreateClick}
        stats={stats}
      />

      {/* Main Panel */}
      <main className="main-content">
        
        {/* Top Header Bar */}
        <header className="top-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by title, description, tags, or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Stats stats={stats} />
        </header>

        {/* Snippets Grid */}
        <section className="grid-container">
          
          <div className="grid-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 className="grid-title">{getFilterTitle()}</h2>
              {activeFilter.type !== 'all' && (
                <button 
                  className="active-filter-badge"
                  onClick={() => setActiveFilter({ type: 'all' })}
                >
                  Clear filter
                  <span className="active-filter-close"><X size={12} /></span>
                </button>
              )}
            </div>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {snippets.length} snippet{snippets.length === 1 ? '' : 's'}
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          {isLoading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '4rem', 
              color: 'var(--text-muted)' 
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255,255,255,0.05)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'fadeIn 0.6s linear infinite, spin 1s linear infinite'
              }}></div>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
              <span style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Loading snippets...</span>
            </div>
          ) : snippets.length === 0 ? (
            <div className="empty-state">
              <Code2 className="empty-state-icon" />
              <h3 className="empty-state-title">No snippets found</h3>
              <p>
                {searchQuery || activeFilter.type !== 'all' 
                  ? 'Try relaxing your search terms or active filters.'
                  : 'Start cataloging your development code snippets by clicking "New Snippet"!'
                }
              </p>
              {!searchQuery && activeFilter.type === 'all' && (
                <button 
                  className="btn-primary" 
                  onClick={handleCreateClick}
                  style={{ marginTop: '0.5rem' }}
                >
                  Create Your First Snippet
                </button>
              )}
            </div>
          ) : (
            <div className="snippets-grid">
              {snippets.map(snippet => (
                <SnippetCard 
                  key={snippet._id || snippet.id}
                  snippet={snippet}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteSnippet}
                  onTogglePin={handleTogglePin}
                  onTagClick={(tag) => setActiveFilter({ type: 'tag', val: tag })}
                />
              ))}
            </div>
          )}

        </section>

      </main>

      {/* Editor Modal Form */}
      {isFormOpen && (
        <SnippetForm 
          snippet={editingSnippet}
          onSave={handleSaveSnippet}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSnippet(null);
          }}
        />
      )}
    </div>
  );
}
