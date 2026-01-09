'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getStoredToken } from '@/lib/api';
import { Folder, FolderPlus, ChevronRight, MoreVertical, Edit, Trash2, FolderOpen } from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
  assetCount: number;
  children?: FolderItem[];
  isOpen?: boolean;
}

const mockFolders: FolderItem[] = [
  {
    id: '1',
    name: 'Marketing',
    assetCount: 45,
    children: [
      { id: '1-1', name: 'Campaign 2024', assetCount: 23 },
      { id: '1-2', name: 'Social Media', assetCount: 12 },
      { id: '1-3', name: 'Brand Assets', assetCount: 10 },
    ],
  },
  {
    id: '2',
    name: 'Production',
    assetCount: 128,
    children: [
      { id: '2-1', name: 'Raw Footage', assetCount: 89 },
      { id: '2-2', name: 'Final Cuts', assetCount: 24 },
      { id: '2-3', name: 'Audio', assetCount: 15 },
    ],
  },
  {
    id: '3',
    name: 'Archive',
    assetCount: 312,
    children: [
      { id: '3-1', name: '2023', assetCount: 156 },
      { id: '3-2', name: '2022', assetCount: 156 },
    ],
  },
  { id: '4', name: 'Shared', assetCount: 67 },
  { id: '5', name: 'Templates', assetCount: 18 },
];

export default function FoldersPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderItem[]>(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolder = (folder: FolderItem, level = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
            isSelected
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-background-light text-text-secondary hover:text-white'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => {
            setSelectedFolder(folder.id);
            if (hasChildren) toggleFolder(folder.id);
          }}
        >
          {hasChildren ? (
            <ChevronRight
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          ) : (
            <span className="w-4" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-5 h-5 text-primary" />
          ) : (
            <Folder className="w-5 h-5" />
          )}
          <span className="flex-1 text-sm font-medium">{folder.name}</span>
          <span className="text-xs text-text-muted">{folder.assetCount}</span>
          <button
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-background-hover rounded transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-text-muted mb-4">Please log in to view folders.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium"
          >
            Go to Login
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Folder Tree */}
        <div className="w-80 bg-background-medium rounded-xl border border-background-light flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-background-light">
            <h2 className="font-semibold text-white">Folders</h2>
            <button className="p-2 hover:bg-background-light rounded-lg transition-colors text-text-muted hover:text-white">
              <FolderPlus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {folders.map((folder) => renderFolder(folder))}
          </div>
        </div>

        {/* Folder Content */}
        <div className="flex-1 bg-background-medium rounded-xl border border-background-light p-6">
          {selectedFolder ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Folder className="w-8 h-8 text-primary" />
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      {folders.find((f) => f.id === selectedFolder)?.name ||
                        folders.flatMap((f) => f.children || []).find((c) => c.id === selectedFolder)?.name}
                    </h1>
                    <p className="text-sm text-text-muted">
                      {folders.find((f) => f.id === selectedFolder)?.assetCount ||
                        folders.flatMap((f) => f.children || []).find((c) => c.id === selectedFolder)?.assetCount}{' '}
                      assets
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-background-light rounded-lg transition-colors text-text-muted hover:text-white">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-background-light rounded-lg transition-colors text-text-muted hover:text-error">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video bg-background-light rounded-lg flex items-center justify-center"
                  >
                    <span className="text-text-muted text-sm">Asset {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Folder className="w-16 h-16 text-text-muted mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Folder</h3>
              <p className="text-sm text-text-muted">Choose a folder from the tree to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
