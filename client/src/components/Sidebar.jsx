import React from 'react';
import { 
  Code2, 
  Layers, 
  Pin, 
  Plus, 
  Terminal, 
  Tag, 
  Globe2 
} from 'lucide-react';

export default function Sidebar({ 
  currentFilter, 
  setFilter, 
  onAddClick, 
  stats 
}) {
  const { totalCount = 0, pinnedCount = 0, languageCounts = {}, topTags = [] } = stats || {};

  // Standard language list we support
  const languagesList = [
    { key: 'javascript', label: 'JavaScript' },
    { key: 'typescript', label: 'TypeScript' },
    { key: 'python', label: 'Python' },
    { key: 'css', label: 'CSS' },
    { key: 'html', label: 'HTML' },
    { key: 'go', label: 'Go' },
    { key: 'rust', label: 'Rust' },
    { key: 'sql', label: 'SQL' },
    { key: 'shell', label: 'Shell' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Code2 className="text-indigo-400" size={28} style={{ color: '#6366f1' }} />
        <span className="logo-glow">DevSnippet</span>
      </div>

      <div className="sidebar-content">
        {/* Create Snippet Action */}
        <button className="btn-primary" onClick={onAddClick}>
          <Plus size={18} />
          New Snippet
        </button>

        {/* Core Categories */}
        <div className="sidebar-nav-section">
          <h3 className="nav-group-title">Library</h3>
          <ul className="nav-list">
            <li>
              <button 
                className={`nav-item ${currentFilter.type === 'all' ? 'active' : ''}`}
                onClick={() => setFilter({ type: 'all' })}
              >
                <Layers size={16} />
                All Snippets
                <span className="nav-count">{totalCount}</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentFilter.type === 'pinned' ? 'active' : ''}`}
                onClick={() => setFilter({ type: 'pinned' })}
              >
                <Pin size={16} />
                Pinned
                <span className="nav-count">{pinnedCount}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Languages */}
        <div className="sidebar-nav-section">
          <h3 className="nav-group-title">Languages</h3>
          <ul className="nav-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {languagesList.map(lang => {
              const count = languageCounts[lang.key] || 0;
              return (
                <li key={lang.key}>
                  <button 
                    className={`nav-item ${currentFilter.type === 'language' && currentFilter.val === lang.key ? 'active' : ''}`}
                    onClick={() => setFilter({ type: 'language', val: lang.key })}
                  >
                    <Terminal size={16} />
                    {lang.label}
                    {count > 0 && <span className="nav-count">{count}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Top Tags */}
        <div className="sidebar-nav-section" style={{ flex: 1 }}>
          <h3 className="nav-group-title">Popular Tags</h3>
          {topTags.length === 0 ? (
            <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No tags found yet
            </div>
          ) : (
            <ul className="nav-list">
              {topTags.map(tag => (
                <li key={tag.name}>
                  <button 
                    className={`nav-item ${currentFilter.type === 'tag' && currentFilter.val === tag.name ? 'active' : ''}`}
                    onClick={() => setFilter({ type: 'tag', val: tag.name })}
                  >
                    <Tag size={14} />
                    #{tag.name}
                    <span className="nav-count">{tag.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
