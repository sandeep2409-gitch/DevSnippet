import React from 'react';
import { Database, Pin, Code } from 'lucide-react';

export default function Stats({ stats }) {
  const { totalCount = 0, pinnedCount = 0, dbMode = 'Checking...' } = stats || {};
  const isFallback = dbMode.toLowerCase().includes('fallback') || dbMode.toLowerCase().includes('json');

  return (
    <div className="stats-ribbon">
      {/* DB Connection Mode Pill */}
      <div className="stat-pill">
        <Database size={16} className={isFallback ? 'text-amber-400' : 'text-emerald-400'} style={{ color: isFallback ? '#fbbf24' : '#34d399' }} />
        <span className="stat-pill-label">Database:</span>
        <div className={`db-indicator ${isFallback ? 'fallback' : ''}`}>
          <span className="db-indicator-dot"></span>
          <span>{dbMode}</span>
        </div>
      </div>

      {/* Total Snippets Pill */}
      <div className="stat-pill">
        <Code size={16} className="text-indigo-400" style={{ color: '#818cf8' }} />
        <span className="stat-pill-label">Total Snippets:</span>
        <span className="stat-pill-value">{totalCount}</span>
      </div>

      {/* Pinned Snippets Pill */}
      <div className="stat-pill">
        <Pin size={16} className="text-purple-400" style={{ color: '#c084fc' }} />
        <span className="stat-pill-label">Pinned:</span>
        <span className="stat-pill-value">{pinnedCount}</span>
      </div>
    </div>
  );
}
