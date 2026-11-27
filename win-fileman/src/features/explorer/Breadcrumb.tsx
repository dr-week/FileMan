import React from 'react';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  onNavigateNewTab?: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate, onNavigateNewTab }) => {
  const segments = path.replace(/\\/g, '/').split('/').filter(Boolean);
  const hasDriveRoot = /^[a-z]:$/i.test(segments[0] ?? '');
  const root = hasDriveRoot ? `${segments[0]}\\` : '/';
  const pathSegments = hasDriveRoot ? segments.slice(1) : segments;
  let segmentPath = root;

  const handleAuxClick = (e: React.MouseEvent, target: string) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      onNavigateNewTab?.(target);
    }
  };

  return (
    <div className="breadcrumb-bar" onMouseDown={e => { if (e.button === 1) e.preventDefault(); }}>
      <button
        type="button"
        className="breadcrumb-root"
        onClick={() => onNavigate(root)}
        onMouseDown={e => handleAuxClick(e, root)}
        onAuxClick={e => handleAuxClick(e, root)}
        title={`${root} (Middle-click to open in new tab)`}
      >
        {hasDriveRoot ? segments[0] : 'Root'}
      </button>
      {pathSegments.map((segment, index) => {
        segmentPath = `${segmentPath.replace(/[\\/]$/, '')}\\${segment}`;
        const targetPath = segmentPath;
        return (
          <React.Fragment key={`${segment}-${index}`}>
            <span className="breadcrumb-separator">›</span>
            <button
              type="button"
              className="breadcrumb-segment"
              onClick={() => onNavigate(targetPath)}
              onMouseDown={e => handleAuxClick(e, targetPath)}
              onAuxClick={e => handleAuxClick(e, targetPath)}
              title={`${targetPath} (Middle-click to open in new tab)`}
            >
              {segment}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
