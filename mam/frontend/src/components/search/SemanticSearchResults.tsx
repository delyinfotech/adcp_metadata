'use client';

import { useState, useMemo } from 'react';
import { Play, Video, Image, Music, FileText, ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';
import { SemanticSearchResult, VideoMoment, Asset as ApiAsset } from '@/lib/api';

interface EnrichedResult {
  asset?: ApiAsset;
  moments: VideoMoment[];
  topSimilarity: number;
}

interface SemanticSearchResultsProps {
  results: SemanticSearchResult[];
  assets: ApiAsset[];
  query: string;
  onAssetClick: (asset: ApiAsset) => void;
  onSeekToMoment: (asset: ApiAsset, timestamp: number) => void;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getAssetIcon(assetType: string) {
  switch (assetType) {
    case 'video':
      return Video;
    case 'image':
      return Image;
    case 'audio':
      return Music;
    default:
      return FileText;
  }
}

function getSimilarityBadge(similarity: number): { color: string; label: string } {
  if (similarity >= 0.8) return { color: 'bg-green-500/20 text-green-400', label: 'Excellent' };
  if (similarity >= 0.6) return { color: 'bg-lime-500/20 text-lime-400', label: 'Good' };
  if (similarity >= 0.4) return { color: 'bg-yellow-500/20 text-yellow-400', label: 'Fair' };
  return { color: 'bg-orange-500/20 text-orange-400', label: 'Possible' };
}

export default function SemanticSearchResults({
  results,
  assets,
  query,
  onAssetClick,
  onSeekToMoment,
}: SemanticSearchResultsProps) {
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  // Group results by content and enrich with asset data
  const enrichedResults = useMemo(() => {
    const grouped = new Map<string, EnrichedResult>();

    for (const result of results) {
      const existing = grouped.get(result.contentId);
      const asset = assets.find((a) => a.id === result.contentId);

      if (existing) {
        if (result.timestamp !== undefined) {
          existing.moments.push({
            timestamp: result.timestamp,
            frameNumber: result.frameNumber || 0,
            similarity: result.similarity,
            sceneIndex: result.sceneIndex,
            sceneStart: result.metadata?.sceneStart,
            sceneEnd: result.metadata?.sceneEnd,
          });
        }
        if (result.similarity > existing.topSimilarity) {
          existing.topSimilarity = result.similarity;
        }
      } else {
        grouped.set(result.contentId, {
          asset,
          moments: result.timestamp !== undefined
            ? [{
                timestamp: result.timestamp,
                frameNumber: result.frameNumber || 0,
                similarity: result.similarity,
                sceneIndex: result.sceneIndex,
                sceneStart: result.metadata?.sceneStart,
                sceneEnd: result.metadata?.sceneEnd,
              }]
            : [],
          topSimilarity: result.similarity,
        });
      }
    }

    // Sort by top similarity
    return Array.from(grouped.entries())
      .sort((a, b) => b[1].topSimilarity - a[1].topSimilarity);
  }, [results, assets]);

  const toggleExpanded = (contentId: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
    }
    setExpandedAssets(newExpanded);
  };

  if (enrichedResults.length === 0) {
    return (
      <div className="text-center py-16 bg-background-medium rounded-xl border border-background-light">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No semantic matches found</h3>
        <p className="text-text-muted">
          Try rephrasing your query or use more descriptive terms
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-text-muted">
            AI found <span className="text-white font-medium">{enrichedResults.length}</span> matching assets
            with <span className="text-white font-medium">{results.length}</span> total moments
          </span>
        </div>
        <p className="text-sm text-text-muted">
          Sorted by relevance
        </p>
      </div>

      {/* Results */}
      {enrichedResults.map(([contentId, data]) => {
        const { asset, moments, topSimilarity } = data;
        const isExpanded = expandedAssets.has(contentId);
        const Icon = asset ? getAssetIcon(asset.assetType) : FileText;
        const badge = getSimilarityBadge(topSimilarity);

        return (
          <div
            key={contentId}
            className="bg-background-medium rounded-xl border border-background-light overflow-hidden"
          >
            {/* Asset header */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-background-light transition-colors"
              onClick={() => asset && onAssetClick(asset)}
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-16 bg-background-light rounded-lg overflow-hidden flex-shrink-0">
                {asset?.thumbnailUrl ? (
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-text-muted" />
                  </div>
                )}
                {asset?.duration && (
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white">
                    {formatTimestamp(asset.duration)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium truncate">
                    {asset?.title || contentId}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                    {Math.round(topSimilarity * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-text-muted truncate">
                  {asset?.filename || 'Unknown file'}
                </p>
                {moments.length > 0 && (
                  <p className="text-xs text-primary mt-1">
                    {moments.length} moment{moments.length !== 1 ? 's' : ''} match your query
                  </p>
                )}
              </div>

              {/* Expand toggle for videos with moments */}
              {moments.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(contentId);
                  }}
                  className="p-2 hover:bg-background-hover rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  )}
                </button>
              )}
            </div>

            {/* Expanded moments */}
            {isExpanded && moments.length > 0 && (
              <div className="border-t border-background-light">
                <div className="px-4 py-2 bg-background-dark/50 text-xs text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Click any moment to jump to that point
                </div>
                <div className="divide-y divide-background-light/50 max-h-48 overflow-y-auto">
                  {moments
                    .sort((a, b) => b.similarity - a.similarity)
                    .map((moment, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (asset) onSeekToMoment(asset, moment.timestamp);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-4 hover:bg-background-light transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 min-w-[70px]">
                          <Play className="w-3 h-3 text-primary" />
                          <span className="text-white font-mono text-sm">
                            {formatTimestamp(moment.timestamp)}
                          </span>
                        </div>
                        <div className="flex-1 h-1.5 bg-background-light rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${moment.similarity * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted">
                          {Math.round(moment.similarity * 100)}%
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
