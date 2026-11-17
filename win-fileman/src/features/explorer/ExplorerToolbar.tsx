import React from 'react';

interface ExplorerToolbarProps {
  sortMode: 'name' | 'size' | 'modifiedAt';
  onSortChange: (value: 'name' | 'size' | 'modifiedAt') => void;
  viewMode: 'list' | 'grid';
  onViewChange: (value: 'list' | 'grid') => void;
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({
  sortMode,
  onSortChange,
  viewMode,
  onViewChange,
}) => {
  return (
    <div className="explorer-toolbar">
      <select
        className="explorer-select"
        value={sortMode}
        onChange={(event) => onSortChange(event.target.value as 'name' | 'size' | 'modifiedAt')}
      >
        <option value="name">Name</option>
        <option value="size">Size</option>
        <option value="modifiedAt">Modified</option>
      </select>

      <div className="explorer-view-switch">
        <button
          className={viewMode === 'list' ? 'active' : ''}
          onClick={() => onViewChange('list')}
          type="button"
        >
          List
        </button>
        <button
          className={viewMode === 'grid' ? 'active' : ''}
          onClick={() => onViewChange('grid')}
          type="button"
        >
          Grid
        </button>
      </div>
    </div>
  );
};
