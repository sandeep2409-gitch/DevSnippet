import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Pin, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Calendar 
} from 'lucide-react';

export default function SnippetCard({ 
  snippet, 
  onEdit, 
  onDelete, 
  onTogglePin, 
  onTagClick 
}) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { _id, id, title, code, language, description, tags = [], pinned, createdAt } = snippet;
  const snippetId = _id || id;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Check if code block is long enough to justify an expand button
  const lineCount = code.split('\n').length;
  const showExpandButton = lineCount > 6;

  return (
    <article className={`snippet-card ${pinned ? 'pinned' : ''}`}>
      {/* Top Header */}
      <div className="snippet-card-header">
        <div className="snippet-card-title-area">
          <span className={`language-badge lang-${language.toLowerCase()}`}>
            {language}
          </span>
          <h3 className="snippet-card-title">{title}</h3>
        </div>

        {/* Top Right Actions */}
        <div className="card-actions">
          <button 
            className={`icon-btn btn-pin ${pinned ? 'active' : ''}`}
            title={pinned ? 'Unpin snippet' : 'Pin snippet'}
            onClick={() => onTogglePin(snippet)}
          >
            <Pin size={16} fill={pinned ? 'currentColor' : 'none'} />
          </button>
          <button 
            className="icon-btn" 
            title="Edit snippet"
            onClick={() => onEdit(snippet)}
          >
            <Edit3 size={16} />
          </button>
          <button 
            className="icon-btn btn-delete" 
            title="Delete snippet"
            onClick={() => onDelete(snippetId)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className={`snippet-card-description ${isExpanded ? 'expanded' : ''}`}>
          {description}
        </p>
      )}

      {/* Code Window with Syntax Highlighting */}
      <div className={`code-wrapper ${showExpandButton && !isExpanded ? 'minimized' : ''}`}>
        <div className="code-header-overlay">
          <button 
            className="icon-btn" 
            onClick={handleCopy}
            title="Copy Code"
            style={{ 
              backgroundColor: 'rgba(20, 22, 36, 0.8)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              padding: '0.4rem'
            }}
          >
            {copied ? (
              <Check size={14} style={{ color: '#10b981' }} />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '1.25rem 1rem',
            background: 'transparent',
          }}
          className="code-highlighter"
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Expand/Collapse Button */}
      {showExpandButton && (
        <button 
          className="expand-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Show more ({lineCount} lines)
            </>
          )}
        </button>
      )}

      {/* Bottom Area */}
      <div className="card-footer">
        {tags.length > 0 && (
          <div className="tags-list">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="tag-badge"
                onClick={() => onTagClick(tag)}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="card-meta-date" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Calendar size={12} />
          <span>Created on {formatDate(createdAt)}</span>
        </div>
      </div>
    </article>
  );
}
