import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Folder, HardDrive } from 'lucide-react';
import { FileEntry } from '../shared/types';
import { FileSystemLocation, getLibraryLocations, listDirectory, listDrives } from '../../services/fileSystemApi';

interface ExplorerNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onSelectFiles: () => void;
}

interface TreeNodeProps {
  name: string;
  path: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  isRoot?: boolean;
}

const DirectoryNode: React.FC<TreeNodeProps> = ({ name, path, currentPath, onNavigate, isRoot = false }) => {
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

  return (
    <div className="location-tree-node">
      <div className={`location-tree-row ${currentPath.toLowerCase() === path.toLowerCase() ? 'active' : ''}`}>
        <button type="button" className="tree-expander" onClick={toggle} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${name}`}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <button type="button" className="tree-location" onClick={() => onNavigate(path)}>
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
                title={location.path}
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