import React from 'react';
import { Search } from 'lucide-react';

interface HeaderBarProps {
  currentPath: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentPath,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="header-bar">
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)', letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {currentPath}
      </div>
      <div className="search-box">
        <Search size={16} color="#94a3b8" />
        <input
          className="search-input"
          placeholder="Search files"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
