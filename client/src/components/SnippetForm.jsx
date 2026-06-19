import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function SnippetForm({ snippet, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [pinned, setPinned] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title || '');
      setCode(snippet.code || '');
      setLanguage(snippet.language || 'javascript');
      setDescription(snippet.description || '');
      setTagsInput(snippet.tags ? snippet.tags.join(', ') : '');
      setPinned(snippet.pinned || false);
    } else {
      // Clear form for new snippets
      setTitle('');
      setCode('');
      setLanguage('javascript');
      setDescription('');
      setTagsInput('');
      setPinned(false);
    }
    setErrors({});
  }, [snippet]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple Validation
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = 'Title is required';
    if (!code.trim()) validationErrors.code = 'Code content is required';
    if (!language) validationErrors.language = 'Language is required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Convert comma-separated tags into a clean array
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag !== '');

    const snippetData = {
      title: title.trim(),
      code: code.trim(),
      language,
      description: description.trim(),
      tags,
      pinned
    };

    onSave(snippetData);
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {snippet ? 'Edit Snippet' : 'Create New Snippet'}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Snippet Title *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Fetch API helper, Centering a Div"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={errors.title ? { borderColor: '#f87171' } : {}}
            />
            {errors.title && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.title}</span>}
          </div>

          {/* Language & Pinned row */}
          <div className="form-group-row">
            <div className="form-group">
              <label className="form-label">Programming Language *</label>
              <select 
                className="form-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell / Bash</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group" style={{ justifyContent: 'center', paddingLeft: '0.5rem' }}>
              <label className="checkbox-label" style={{ marginTop: '1.25rem' }}>
                <input 
                  type="checkbox" 
                  className="checkbox-input"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
                Pin to top library
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Short Description</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="What does this code snippet do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. react, hooks, async, helper"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Code Area */}
          <div className="form-group">
            <label className="form-label">Code Content *</label>
            <textarea 
              className="form-input form-textarea form-textarea-code" 
              rows={8}
              placeholder="// Paste or write your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={errors.code ? { borderColor: '#f87171' } : {}}
            ></textarea>
            {errors.code && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errors.code}</span>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Save size={16} />
              Save Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
