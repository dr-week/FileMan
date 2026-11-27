import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Folder, HardDrive } from 'lucide-react';
import { FileEntry } from '../shared/types';
import { FileSystemLocation, getLibraryLocations, listDirectory, listDrives } from '../../services/fileSystemApi';

interface ExplorerNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onNavigateNewTab?: (path: string) => void;
  onSelectFiles: () => void;
}

interface TreeNodeProps {
  name: string;
  path: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  onNavigateNewTab?: (path: string) => void;
  isRoot?: boolean;
}

const DirectoryNode: React.FC<TreeNodeProps> = ({
  name,
  path,
  currentPath,
  onNavigate,
  onNavigateNewTab,
  isRoot = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [folders, setFolders] = useState<FileEntry[]>([]);
  const [loadError, setLoadError] = useState(false);

  const toggle = async () => {
    if (!expanded && folders.length === 0 && !loadError) {
      try {
        const listing = await listDirectory(path);
        setFolders(listing.entries
          .filter(entry => entry.type === 'folder' && !entry.isLink)
          .sort((a, b) => a.name.localeCompare(b.name)));
      } catch {
        setLoadError(true);
      }
    }
    setExpanded(value => !value);
  };

  const handleAux = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      onNavigateNewTab?.(path);
    }
  };

  return (
    <div className="location-tree-node">
      <div className={`location-tree-row ${currentPath.toLowerCase() === path.toLowerCase() ? 'active' : ''}`}>
        <button type="button" className="tree-expander" onClick={toggle} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${name}`}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <button
          type="button"
          className="tree-location"
          onClick={() => onNavigate(path)}
          onMouseDown={handleAux}
          onAuxClick={handleAux}
          title={`${path} (Middle-click to open in new tab)`}
        >
          {isRoot ? <HardDrive size={15} /> : <Folder size={15} />}
          <span>{name}</span>
        </button>
      </div>
      {expanded && (
        <div className="location-tree-children">
          {loadError && <span className="location-tree-error">Unavailable</span>}
          {folders.map(folder => (
            <DirectoryNode
              key={folder.id}
              name={folder.name}
              path={folder.path}
              currentPath={currentPath}
              onNavigate={onNavigate}
              onNavigateNewTab={onNavigateNewTab}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ExplorerNavigation: React.FC<ExplorerNavigationProps> = ({
  currentPath,
  onNavigate,
  onNavigateNewTab,
  onSelectFiles,
}) => {
  const [drives, setDrives] = useState<FileSystemLocation[]>([]);
  const [libraries, setLibraries] = useState<FileSystemLocation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listDrives(), getLibraryLocations()])
      .then(([availableDrives, knownFolders]) => {
        setDrives(availableDrives);
        setLibraries(knownFolders);
      })
      .catch(error => setLoadError(error instanceof Error ? error.message : 'Locations unavailable.'));
  }, []);

  const handleAux = (e: React.MouseEvent, path: string) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      onNavigateNewTab?.(path);
    }
  };

  return (
    <nav className="explorer-navigation" aria-label="File locations">
      <button type="button" className="locations-heading" onClick={onSelectFiles}>Locations</button>
      {loadError ? (
        <p className="locations-message">{loadError}</p>
      ) : (
        <>
          <div className="locations-group">
            <span className="locations-section-title">Drives</span>
            {drives.map(drive => (
              <DirectoryNode
                key={drive.path}
                name={drive.name}
                path={drive.path}
                currentPath={currentPath}
                onNavigate={onNavigate}
                onNavigateNewTab={onNavigateNewTab}
                isRoot
              />
            ))}
          </div>
          <div className="locations-group">
            <span className="locations-section-title">Library</span>
            {libraries.map(location => (
              <button
                key={location.name}
                type="button"
                className={`library-location ${currentPath.toLowerCase() === location.path.toLowerCase() ? 'active' : ''}`}
                onClick={() => onNavigate(location.path)}
                onMouseDown={e => handleAux(e, location.path)}
                onAuxClick={e => handleAux(e, location.path)}
                title={`${location.path} (Middle-click to open in new tab)`}
              >
                <Folder size={15} />
                <span>{location.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </nav>
  );
};