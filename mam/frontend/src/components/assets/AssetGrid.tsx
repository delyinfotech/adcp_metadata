'use client';

import { useState } from 'react';
import AssetCard, { Asset } from './AssetCard';
import { Grid, List, SlidersHorizontal, ChevronDown, MoreVertical } from 'lucide-react';

interface AssetGridProps {
  assets: Asset[];
  onAssetClick?: (asset: Asset) => void;
  onBulkDownload?: (assetIds: string[]) => void;
  onBulkDelete?: (assetIds: string[]) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';

const sortOptions = [
  { value: 'date', label: 'Date Modified' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'File Size' },
  { value: 'type', label: 'Type' },
];

const typeFilters = [
  { value: 'all', label: 'All Types' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Document' },
];

const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'ready', label: 'Ready' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
];

export default function AssetGrid({ assets, onAssetClick, onBulkDownload, onBulkDelete }: AssetGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSelectAsset = (id: string) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredAssets = assets.filter((asset) => {
    if (typeFilter !== 'all' && asset.assetType !== typeFilter) return false;
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-background-light">
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 bg-background-medium border border-background-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              {typeFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 bg-background-medium border border-background-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          {/* Advanced Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors ${
              showFilters
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-background-medium border-background-light text-text-secondary hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="appearance-none h-9 pl-3 pr-8 bg-background-medium border border-background-light rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-background-medium rounded-lg border border-background-light p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background-light text-white'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-background-light text-white'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selection Bar */}
      {selectedAssets.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm text-primary font-medium">
            {selectedAssets.size} item{selectedAssets.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex-1" />
          <button
            onClick={() => {
              if (onBulkDownload) {
                onBulkDownload(Array.from(selectedAssets));
              } else {
                alert(`Download ${selectedAssets.size} asset(s) - Feature coming soon`);
              }
            }}
            className="text-sm text-text-secondary hover:text-white"
          >
            Download
          </button>
          <button
            onClick={() => alert('Move to folder - Feature coming soon')}
            className="text-sm text-text-secondary hover:text-white"
          >
            Move
          </button>
          <button
            onClick={() => {
              if (onBulkDelete) {
                if (confirm(`Delete ${selectedAssets.size} asset(s)?`)) {
                  onBulkDelete(Array.from(selectedAssets));
                  setSelectedAssets(new Set());
                }
              } else {
                alert(`Delete ${selectedAssets.size} asset(s) - Feature coming soon`);
              }
            }}
            className="text-sm text-error hover:text-error"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedAssets(new Set())}
            className="text-sm text-text-muted hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Asset Count */}
      <div className="text-sm text-text-muted">
        {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              selected={selectedAssets.has(asset.id)}
              onSelect={handleSelectAsset}
              onClick={onAssetClick}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-background-medium rounded-lg border border-background-light overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-background-light">
                <th className="w-10 p-3">
                  <input type="checkbox" className="rounded bg-background-light border-background-hover" />
                </th>
                <th className="p-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Preview
                </th>
                <th className="p-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Name
                </th>
                <th className="p-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Type
                </th>
                <th className="p-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Size
                </th>
                <th className="p-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="p-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Modified
                </th>
                <th className="w-10 p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-background-light hover:bg-background-hover cursor-pointer"
                  onClick={() => onAssetClick?.(asset)}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedAssets.has(asset.id)}
                      onChange={() => handleSelectAsset(asset.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded bg-background-light border-background-hover"
                    />
                  </td>
                  <td className="p-3">
                    <div className="w-16 h-10 bg-background-light rounded overflow-hidden">
                      {asset.thumbnailUrl ? (
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          {asset.assetType === 'video' && '🎬'}
                          {asset.assetType === 'image' && '🖼️'}
                          {asset.assetType === 'audio' && '🎵'}
                          {asset.assetType === 'document' && '📄'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-white">{asset.title}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-text-secondary capitalize">{asset.assetType}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-text-secondary">
                      {(asset.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        asset.status === 'ready'
                          ? 'bg-status-ready/15 text-status-ready'
                          : asset.status === 'processing'
                          ? 'bg-status-processing/15 text-status-processing'
                          : 'bg-status-failed/15 text-status-failed'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-text-muted">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="p-1 text-text-muted hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-background-medium rounded-full flex items-center justify-center mb-4">
            <Grid className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No assets found</h3>
          <p className="text-sm text-text-muted max-w-sm">
            Upload your first asset or adjust your filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
}
