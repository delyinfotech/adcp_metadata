'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getStoredToken } from '@/lib/api';
import { Star, Plus, Grid, List, MoreVertical, Lock, Globe, Zap } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string;
  assetCount: number;
  thumbnailUrl?: string;
  type: 'manual' | 'smart';
  isPublic: boolean;
  createdBy: string;
  updatedAt: string;
}

const mockCollections: Collection[] = [
  {
    id: '1',
    name: 'Brand Guidelines 2024',
    description: 'Official brand assets including logos, colors, and templates',
    assetCount: 34,
    type: 'manual',
    isPublic: true,
    createdBy: 'Admin',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Product Launch Videos',
    description: 'All video content for Q1 product launches',
    assetCount: 12,
    type: 'manual',
    isPublic: false,
    createdBy: 'Marketing',
    updatedAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Beach & Summer Content',
    description: 'AI-curated collection of beach and summer themed assets',
    assetCount: 89,
    type: 'smart',
    isPublic: true,
    createdBy: 'System',
    updatedAt: '2024-01-13',
  },
  {
    id: '4',
    name: 'Approved for Social',
    description: 'Assets approved for social media distribution',
    assetCount: 56,
    type: 'smart',
    isPublic: false,
    createdBy: 'System',
    updatedAt: '2024-01-12',
  },
  {
    id: '5',
    name: 'Customer Testimonials',
    description: 'Video testimonials from satisfied customers',
    assetCount: 23,
    type: 'manual',
    isPublic: false,
    createdBy: 'Sales',
    updatedAt: '2024-01-11',
  },
  {
    id: '6',
    name: 'High Resolution Images',
    description: 'Images above 4K resolution for print',
    assetCount: 145,
    type: 'smart',
    isPublic: true,
    createdBy: 'System',
    updatedAt: '2024-01-10',
  },
];

export default function CollectionsPage() {
  const router = useRouter();
  const [collections] = useState<Collection[]>(mockCollections);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'manual' | 'smart'>('all');
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
  }, []);

  const filteredCollections = filter === 'all'
    ? collections
    : collections.filter((c) => c.type === filter);

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-text-muted mb-4">Please log in to view collections.</p>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Collections</h1>
            <p className="text-text-muted mt-1">Organize assets into curated collections</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Collection
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between border-b border-background-light pb-4">
          <div className="flex gap-2">
            {(['all', 'manual', 'smart'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-primary text-white'
                    : 'bg-background-medium text-text-secondary hover:bg-background-light hover:text-white'
                }`}
              >
                {type === 'smart' && <Zap className="w-4 h-4" />}
                {type === 'manual' && <Star className="w-4 h-4" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {type !== 'all' && (
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    filter === type ? 'bg-white/20' : 'bg-background-light'
                  }`}>
                    {collections.filter((c) => c.type === type).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-background-medium rounded-lg border border-background-light p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-background-light text-white' : 'text-text-muted hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-background-light text-white' : 'text-text-muted hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collection Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollections.map((collection) => (
              <div
                key={collection.id}
                className="bg-background-medium rounded-xl border border-background-light overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="aspect-video bg-background-light relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Star className="w-12 h-12 text-text-muted" />
                  </div>
                  <div className="absolute top-2 left-2 flex gap-2">
                    {collection.type === 'smart' && (
                      <span className="px-2 py-1 bg-status-processing/20 text-status-processing text-xs font-medium rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Smart
                      </span>
                    )}
                    {collection.isPublic ? (
                      <span className="px-2 py-1 bg-status-ready/20 text-status-ready text-xs font-medium rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-background-dark/50 text-text-muted text-xs font-medium rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    )}
                  </div>
                  <button className="absolute top-2 right-2 p-1.5 bg-background-dark/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white">{collection.name}</h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2">{collection.description}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
                    <span>{collection.assetCount} assets</span>
                    <span>{collection.createdBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-background-medium rounded-xl border border-background-light overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-background-light">
                  <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Name</th>
                  <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Type</th>
                  <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Assets</th>
                  <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Visibility</th>
                  <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Updated</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCollections.map((collection) => (
                  <tr key={collection.id} className="border-b border-background-light hover:bg-background-light cursor-pointer">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium text-white">{collection.name}</p>
                        <p className="text-xs text-text-muted">{collection.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        collection.type === 'smart'
                          ? 'bg-status-processing/20 text-status-processing'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {collection.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">{collection.assetCount}</td>
                    <td className="p-4">
                      {collection.isPublic ? (
                        <Globe className="w-4 h-4 text-status-ready" />
                      ) : (
                        <Lock className="w-4 h-4 text-text-muted" />
                      )}
                    </td>
                    <td className="p-4 text-sm text-text-muted">{collection.updatedAt}</td>
                    <td className="p-4">
                      <button className="p-1.5 hover:bg-background-hover rounded">
                        <MoreVertical className="w-4 h-4 text-text-muted" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
