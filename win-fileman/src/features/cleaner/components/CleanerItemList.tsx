import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CleanerItem } from '../../../services/appCleanerTypes';

interface CleanerItemListProps {
  filteredItems: CleanerItem[];
  selectedItemId: string;
  activeItem: CleanerItem | null;
  onToggleItem: (id: string) => void;
  onSelectItem: (id: string) => void;
}

export const CleanerItemList: React.FC<CleanerItemListProps> = ({
  filteredItems,
  selectedItemId,
  activeItem,
  onToggleItem,
  onSelectItem,
}) => {
  return (
    <div className="cleaner-main-panel">
      <div className="cleaner-items-list">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={36} color="#10b981" />
            <p>All items in this category are completely clean!</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`cleaner-item-row ${item.safety === 'protected' ? 'protected' : ''} ${item.selected ? 'selected' : ''} ${selectedItemId === item.id ? 'active' : ''}`}
              onClick={() => {
                onSelectItem(item.id);
                if (item.safety !== 'protected') onToggleItem(item.id);
              }}
            >
              <input
                type="checkbox"
                checked={item.selected}
                disabled={item.safety === 'protected'}
                onChange={() => {}}
                className="item-checkbox"
              />
              <div className="item-info">
                <div className="item-title-row">
                  <span className="item-name">{item.name}</span>
                  <span className={`safety-badge ${item.safety}`}>
                    {item.safety === 'safe' ? 'Safe' : item.safety === 'caution' ? 'Review' : 'Protected'}
                  </span>
                  <span className="item-size">{item.sizeFormatted}</span>
                </div>
                <div className="item-path">{item.path}</div>
                <div className="item-description">{item.description}</div>
                <div className="item-footer">
                  <span className="item-recommendation">💡 {item.recommendation}</span>
                  <span className="item-meta">
                    {item.fileCount.toLocaleString()} files • Last active: {item.lastModified}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activeItem && (
        <aside className="cleaner-detail-panel">
          <div className="detail-header">
            <span className={`safety-badge ${activeItem.safety}`}>
              {activeItem.safety === 'safe' ? 'Safe' : activeItem.safety === 'caution' ? 'Review' : 'Protected'}
            </span>
            <h3>{activeItem.name}</h3>
          </div>

          <div className="detail-summary">
            <div>
              <span className="detail-label">Size</span>
              <strong>{activeItem.sizeFormatted}</strong>
            </div>
            <div>
              <span className="detail-label">Files</span>
              <strong>{activeItem.fileCount.toLocaleString()}</strong>
            </div>
          </div>

          <dl className="detail-list">
            <div>
              <dt>Path</dt>
              <dd>{activeItem.path}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{activeItem.category}</dd>
            </div>
            <div>
              <dt>Reason</dt>
              <dd>{activeItem.description}</dd>
            </div>
            <div>
              <dt>Recommendation</dt>
              <dd>{activeItem.recommendation}</dd>
            </div>
          </dl>
        </aside>
      )}
    </div>
  );
};
