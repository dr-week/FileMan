import React from 'react';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate }) => {
  const segments = path.replace(/\\/g, '/').split('/').filter(Boolean);
  const hasDriveRoot = /^[a-z]:$/i.test(segments[0] ?? '');
  const root = hasDriveRoot ? `${segments[0]}\\` : '/';
  const pathSegments = hasDriveRoot ? segments.slice(1) : segments;
  let segmentPath = root;

  return (
    <div className="breadcrumb-bar">
      <button type="button" className="breadcrumb-root" onClick={() => onNavigate(root)}>{hasDriveRoot ? segments[0] : 'Root'}</button>
      {pathSegments.map((segment, index) => {
        segmentPath = `${segmentPath.replace(/[\\/]$/, '')}\\${segment}`;
        const targetPath = segmentPath;
        return (
        <React.Fragment key={`${segment}-${index}`}>
          <span className="breadcrumb-separator">›</span>
          <button type="button" className="breadcrumb-segment" onClick={() => onNavigate(targetPath)}>{segment}</button>
        </React.Fragment>
        );
      })}
    </div>
  );
};
