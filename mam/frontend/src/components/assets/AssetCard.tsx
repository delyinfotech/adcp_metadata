'use client';

import { useState } from 'react';
import { Play, Image, Music, FileText, Check, MoreVertical, Download, Trash2, Edit } from 'lucide-react';

export type AssetType = 'video' | 'image' | 'audio' | 'document';
export type AssetStatus = 'ready' | 'processing' | 'failed' | 'archived';

export interface Asset {
  id: string;
  title: string;
  filename: string;
  assetType: AssetType;
  mimeType: string;
  fileSize: number;
  status: AssetStatus;
  cdnUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  aiTags?: string[];
  aiObjects?: Record<string, any> | null;
  aiFaces?: Record<string, any> | null;
  aiTranscript?: string | null;
  aiSentiment?: string | null;
  aiSafetyScore?: number | null;
  aiFeatures?: Record<string, any> | null;
  processingProgress?: number;
  createdAt: string;
}

interface AssetCardProps {
  asset: Asset;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (asset: Asset) => void;
}

const assetTypeIcons = {
  video: Play,
  image: Image,
  audio: Music,
  document: FileText,
};

const statusColors = {
  ready: 'bg-status-ready/15 text-status-ready',
  processing: 'bg-status-processing/15 text-status-processing',
  failed: 'bg-status-failed/15 text-status-failed',
  archived: 'bg-status-archived/15 text-status-archived',
};

const statusLabels = {
  ready: 'Ready',
  processing: 'Processing',
  failed: 'Failed',
  archived: 'Archived',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AssetCard({ asset, selected, onSelect, onClick }: AssetCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const Icon = assetTypeIcons[asset.assetType];

  return (
    <div
      className={`group relative bg-background-medium rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
        selected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-background-hover'
      } hover:translate-y-[-2px] hover:shadow-lg`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      onClick={() => onClick?.(asset)}
    >
      {/* Selection Checkbox - positioned at card level to avoid stacking issues */}
      {(isHovered || selected) && (
        <button
          className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors z-50 pointer-events-auto ${
            selected
              ? 'bg-primary border-primary'
              : 'bg-background-dark/50 border-white/50 hover:border-white'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect?.(asset.id);
          }}
        >
          {selected && <Check className="w-4 h-4 text-white" />}
        </button>
      )}

      {/* Thumbnail */}
      <div className="relative aspect-video bg-background-light">
        {asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-text-muted" />
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium z-10 ${statusColors[asset.status]}`}>
          {statusLabels[asset.status]}
        </div>

        {/* Duration (for video/audio) */}
        {asset.duration && (asset.assetType === 'video' || asset.assetType === 'audio') && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
            {formatDuration(asset.duration)}
          </div>
        )}

        {/* Play Button Overlay (for video) */}
        {asset.assetType === 'video' && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate" title={asset.title}>
              {asset.title}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {formatFileSize(asset.fileSize)} &bull; {asset.assetType.charAt(0).toUpperCase() + asset.assetType.slice(1)}
              {asset.width && asset.height && ` &bull; ${asset.width}x${asset.height}`}
            </p>
          </div>

          {/* More Menu */}
          <div className="relative">
            <button
              className={`p-1 rounded hover:bg-background-hover transition-colors ${
                showMenu ? 'bg-background-hover' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="w-4 h-4 text-text-muted" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-background-light border border-background-hover rounded-lg shadow-xl py-1 z-10">
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-white hover:bg-background-hover">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-white hover:bg-background-hover">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-error hover:bg-background-hover">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Tags */}
        {asset.aiTags && asset.aiTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {asset.aiTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {asset.aiTags.length > 3 && (
              <span className="px-1.5 py-0.5 text-text-muted text-xs">
                +{asset.aiTags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
