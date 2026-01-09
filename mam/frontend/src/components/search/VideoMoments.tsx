'use client';

import { useState } from 'react';
import { Play, Clock, BarChart3, ChevronRight } from 'lucide-react';
import { VideoMoment } from '@/lib/api';

interface VideoMomentsProps {
  moments: VideoMoment[];
  query: string;
  videoTitle: string;
  videoDuration?: number;
  onSeekToMoment: (timestamp: number) => void;
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getSimilarityColor(similarity: number): string {
  if (similarity >= 0.8) return 'bg-green-500';
  if (similarity >= 0.6) return 'bg-lime-500';
  if (similarity >= 0.4) return 'bg-yellow-500';
  return 'bg-orange-500';
}

function getSimilarityLabel(similarity: number): string {
  if (similarity >= 0.8) return 'Excellent match';
  if (similarity >= 0.6) return 'Good match';
  if (similarity >= 0.4) return 'Fair match';
  return 'Possible match';
}

export default function VideoMoments({
  moments,
  query,
  videoTitle,
  videoDuration,
  onSeekToMoment,
}: VideoMomentsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (moments.length === 0) {
    return (
      <div className="bg-background-medium rounded-xl border border-background-light p-6 text-center">
        <BarChart3 className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <h3 className="text-white font-medium mb-1">No matching moments found</h3>
        <p className="text-sm text-text-muted">
          Try a different search query or adjust the similarity threshold
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-medium rounded-xl border border-background-light overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-background-light">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Matching Moments</h3>
            <p className="text-sm text-text-muted">
              Found {moments.length} moment{moments.length !== 1 ? 's' : ''} matching "{query}"
            </p>
          </div>
          <div className="text-xs text-text-muted">
            in <span className="text-white">{videoTitle}</span>
          </div>
        </div>
      </div>

      {/* Timeline visualization */}
      {videoDuration && videoDuration > 0 && (
        <div className="px-4 py-3 bg-background-dark/50 border-b border-background-light">
          <div className="relative h-8 bg-background-light rounded-lg overflow-hidden">
            {/* Timeline background */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-background-hover rounded" />
            </div>

            {/* Moment markers */}
            {moments.map((moment, index) => {
              const position = (moment.timestamp / videoDuration) * 100;
              const width = moment.sceneEnd && moment.sceneStart
                ? ((moment.sceneEnd - moment.sceneStart) / videoDuration) * 100
                : 2;
              const left = moment.sceneStart
                ? (moment.sceneStart / videoDuration) * 100
                : position - 1;

              return (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                  onClick={() => onSeekToMoment(moment.timestamp)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className={`h-4 ${getSimilarityColor(moment.similarity)} opacity-50 group-hover:opacity-100 rounded transition-opacity`}
                  />
                  {/* Tooltip */}
                  {hoveredIndex === index && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background-dark text-white text-xs rounded whitespace-nowrap z-10">
                      {formatTimestamp(moment.timestamp)} - {Math.round(moment.similarity * 100)}% match
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time labels */}
          <div className="flex justify-between mt-1 text-xs text-text-muted">
            <span>0:00</span>
            <span>{formatTimestamp(videoDuration)}</span>
          </div>
        </div>
      )}

      {/* Moments list */}
      <div className="divide-y divide-background-light max-h-80 overflow-y-auto">
        {moments.map((moment, index) => (
          <button
            key={index}
            onClick={() => onSeekToMoment(moment.timestamp)}
            className="w-full px-4 py-3 flex items-center gap-4 hover:bg-background-light transition-colors text-left"
          >
            {/* Timestamp */}
            <div className="flex items-center gap-2 min-w-[80px]">
              <Play className="w-4 h-4 text-primary" />
              <span className="text-white font-mono text-sm">
                {formatTimestamp(moment.timestamp)}
              </span>
            </div>

            {/* Similarity bar */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-background-light rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getSimilarityColor(moment.similarity)} transition-all`}
                    style={{ width: `${moment.similarity * 100}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted min-w-[40px] text-right">
                  {Math.round(moment.similarity * 100)}%
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {getSimilarityLabel(moment.similarity)}
                {moment.sceneIndex !== undefined && ` · Scene ${moment.sceneIndex + 1}`}
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        ))}
      </div>

      {/* Footer tip */}
      <div className="px-4 py-2 bg-background-dark/50 border-t border-background-light">
        <p className="text-xs text-text-muted flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Click on any moment to jump to that point in the video
        </p>
      </div>
    </div>
  );
}
