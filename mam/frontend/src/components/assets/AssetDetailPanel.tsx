'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Download, Edit, Trash2, Share2, Clock, HardDrive, FileType, Calendar, Tag, Info, Maximize, Loader2, Brain, MessageSquare, Shield, RefreshCw, Play } from 'lucide-react';
import { Asset } from './AssetCard';
import { getDownloadUrl, triggerExtraction } from '@/lib/api';

interface AssetDetailPanelProps {
  asset: Asset | null;
  onClose: () => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
  onRefresh?: () => void;
  seekToTimestamp?: number | null;
}

// Animation states for the slider
type SlideState = 'closed' | 'opening' | 'open' | 'closing';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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

export default function AssetDetailPanel({ asset, onClose, onEdit, onDelete, onRefresh, seekToTimestamp }: AssetDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'metadata' | 'versions'>('details');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);
  const [slideState, setSlideState] = useState<SlideState>('closed');
  const videoRef = useRef<HTMLVideoElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle slide-in animation when asset changes
  useEffect(() => {
    if (asset) {
      setSlideState('opening');
      const timer = setTimeout(() => setSlideState('open'), 10);
      return () => clearTimeout(timer);
    } else {
      setSlideState('closed');
    }
  }, [asset?.id]);

  // Handle closing with animation
  const handleClose = useCallback(() => {
    setSlideState('closing');
    setTimeout(() => {
      onClose();
    }, 300); // Match transition duration
  }, [onClose]);

  // Handle click outside to close
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && asset) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [asset, handleClose]);

  useEffect(() => {
    if (asset && (asset.assetType === 'video' || asset.assetType === 'audio')) {
      loadVideoUrl();
    }
    return () => {
      setVideoUrl(null);
      setVideoError(null);
      setVideoReady(false);
      setPendingSeek(null);
    };
  }, [asset?.id]);

  // Store pending seek when timestamp is provided
  useEffect(() => {
    if (seekToTimestamp !== null && seekToTimestamp !== undefined) {
      setPendingSeek(seekToTimestamp);
    }
  }, [seekToTimestamp]);

  // Execute seek when video is ready and we have a pending seek
  useEffect(() => {
    if (videoReady && pendingSeek !== null && videoRef.current) {
      videoRef.current.currentTime = pendingSeek;
      videoRef.current.play().catch(() => {});
      setPendingSeek(null);
    }
  }, [videoReady, pendingSeek]);

  const loadVideoUrl = async () => {
    if (!asset) return;
    setLoadingVideo(true);
    setVideoError(null);
    setVideoReady(false);
    try {
      const result = await getDownloadUrl(asset.id);
      console.log('Video URL loaded:', result.url);
      setVideoUrl(result.url);
    } catch (error) {
      console.error('Failed to load video URL:', error);
      setVideoError(error instanceof Error ? error.message : 'Failed to load video');
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleTriggerExtraction = async () => {
    if (!asset) return;
    setExtracting(true);
    try {
      await triggerExtraction(asset.id, { force: true });
      onRefresh?.();
    } catch (error) {
      console.error('Failed to trigger extraction:', error);
    } finally {
      setExtracting(false);
    }
  };

  if (!asset && slideState === 'closed') return null;

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'metadata', label: 'AI Metadata' },
    { id: 'versions', label: 'Versions' },
  ];

  // Extract technical metadata from aiFeatures
  const visionFeatures = asset?.aiFeatures?.vision || {};
  const audioFeatures = asset?.aiFeatures?.audio || {};
  const nlpFeatures = asset?.aiFeatures?.nlp || {};

  // Extract flattened data from nested frame-based structure
  const extractedColors: string[] = [];
  const extractedScenes: string[] = [];
  const extractedObjects: string[] = [];
  let safetyScore: number | null = null;

  if (visionFeatures.frames && Array.isArray(visionFeatures.frames)) {
    visionFeatures.frames.forEach((frame: any) => {
      // Extract colors
      if (frame.features?.colors?.dominant) {
        frame.features.colors.dominant.forEach((c: string) => {
          if (!extractedColors.includes(c)) extractedColors.push(c);
        });
      }
      // Extract scenes
      if (frame.features?.scenes) {
        frame.features.scenes.forEach((s: any) => {
          const desc = s.description || s.label;
          if (desc && !extractedScenes.includes(desc)) extractedScenes.push(desc);
        });
      }
      // Extract objects
      if (frame.features?.objects) {
        Object.keys(frame.features.objects).forEach((obj: string) => {
          if (!extractedObjects.includes(obj)) extractedObjects.push(obj);
        });
      }
      // Extract safety score (use first frame's score)
      if (safetyScore === null && frame.features?.safety_labels?.safe) {
        safetyScore = frame.features.safety_labels.safe;
      }
    });
  }

  // Check if we have any meaningful AI data
  const hasVisionData = Object.keys(visionFeatures).length > 0 || extractedColors.length > 0;
  const hasAudioData = Object.keys(audioFeatures).length > 0;
  const hasNlpData = Object.keys(nlpFeatures).length > 0;
  const hasAnyAiData = hasVisionData || hasAudioData || hasNlpData ||
    (asset?.aiTags && asset.aiTags.length > 0) ||
    asset?.aiTranscript ||
    asset?.aiSentiment ||
    (asset?.aiObjects && Object.keys(asset.aiObjects).length > 0);

  // Determine animation classes
  const isVisible = slideState === 'open' || slideState === 'opening';
  const backdropClass = isVisible ? 'opacity-100' : 'opacity-0';
  const panelTransform = slideState === 'open' ? 'translate-x-0' : 'translate-x-full';

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${backdropClass}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Slider Panel */}
      <div
        ref={panelRef}
        className={`fixed inset-y-0 right-0 w-[420px] bg-background-medium border-l border-background-light shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${panelTransform}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-background-light">
          <h2 className="text-lg font-semibold text-white truncate">{asset?.title}</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-text-muted hover:text-white hover:bg-background-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="relative aspect-video bg-background-dark">
          {asset && (asset.assetType === 'video' || asset.assetType === 'audio') && videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onLoadedMetadata={() => setVideoReady(true)}
              onError={(e) => {
                console.error('Video error:', e);
                setVideoError('Failed to play video');
                setVideoReady(false);
              }}
              controls
              crossOrigin="anonymous"
            />
          ) : videoError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
              <FileType className="w-12 h-12 text-status-failed mb-2" />
              <p className="text-sm text-status-failed">{videoError}</p>
              <button
                onClick={loadVideoUrl}
                className="mt-2 px-3 py-1 bg-background-light hover:bg-background-hover text-white text-xs rounded"
              >
                Retry
              </button>
            </div>
          ) : asset?.thumbnailUrl ? (
            <img
              src={asset.thumbnailUrl}
              alt={asset.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {loadingVideo ? (
                <Loader2 className="w-12 h-12 text-text-muted animate-spin" />
              ) : (
                <FileType className="w-16 h-16 text-text-muted" />
              )}
            </div>
          )}

          {/* Processing Overlay */}
          {asset?.status === 'processing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
              <span className="text-white text-sm">Processing... {asset.processingProgress || 0}%</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {asset && (
          <div className="flex items-center gap-2 p-4 border-b border-background-light">
            <button
              onClick={async () => {
                const result = await getDownloadUrl(asset.id);
                window.open(result.url, '_blank');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleTriggerExtraction}
              disabled={extracting || asset.status === 'processing'}
              className="p-2 bg-background-light hover:bg-background-hover text-text-secondary hover:text-white rounded-lg transition-colors disabled:opacity-50"
              title="Re-extract metadata"
            >
              {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEdit?.(asset)}
              className="p-2 bg-background-light hover:bg-background-hover text-text-secondary hover:text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 bg-background-light hover:bg-background-hover text-text-secondary hover:text-white rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(asset)}
              className="p-2 bg-background-light hover:bg-background-hover text-error rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-background-light">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'details' && asset && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">File Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FileType className="w-4 h-4 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">File Name</p>
                      <p className="text-sm text-white">{asset.filename}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-4 h-4 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Size</p>
                      <p className="text-sm text-white">{formatFileSize(asset.fileSize)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Type</p>
                      <p className="text-sm text-white">{asset.mimeType}</p>
                    </div>
                  </div>
                  {asset.width && asset.height && (
                    <div className="flex items-center gap-3">
                      <Maximize className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-xs text-text-muted">Dimensions</p>
                        <p className="text-sm text-white">{asset.width} x {asset.height}</p>
                      </div>
                    </div>
                  )}
                  {asset.duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-xs text-text-muted">Duration</p>
                        <p className="text-sm text-white">{formatDuration(asset.duration)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <div>
                      <p className="text-xs text-text-muted">Created</p>
                      <p className="text-sm text-white">
                        {new Date(asset.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Tags */}
              {asset.aiTags && asset.aiTags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    AI-Generated Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {asset.aiTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Status</h3>
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    asset.status === 'ready'
                      ? 'bg-status-ready/15 text-status-ready'
                      : asset.status === 'processing'
                      ? 'bg-status-processing/15 text-status-processing'
                      : asset.status === 'failed'
                      ? 'bg-status-failed/15 text-status-failed'
                      : 'bg-status-archived/15 text-status-archived'
                  }`}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </div>
                  {asset.status === 'processing' && asset.processingProgress !== undefined && (
                    <span className="text-sm text-text-muted">{asset.processingProgress}%</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && asset && (
            <div className="space-y-5">
              {/* Debug: Show raw aiFeatures structure */}
              {asset.aiFeatures && (
                <details className="bg-background-light rounded-lg p-2">
                  <summary className="text-xs text-text-muted cursor-pointer">Debug: Raw aiFeatures (click to expand)</summary>
                  <pre className="text-xs text-text-secondary mt-2 overflow-auto max-h-40">
                    vision keys: {JSON.stringify(Object.keys(asset.aiFeatures?.vision || {}))}
                    {'\n'}frames count: {asset.aiFeatures?.vision?.frames?.length || 0}
                    {'\n'}first frame keys: {JSON.stringify(Object.keys(asset.aiFeatures?.vision?.frames?.[0] || {}))}
                    {'\n'}first frame features keys: {JSON.stringify(Object.keys(asset.aiFeatures?.vision?.frames?.[0]?.features || {}))}
                    {'\n'}extractedColors: {extractedColors.length}
                    {'\n'}extractedScenes: {extractedScenes.length}
                    {'\n'}extractedObjects: {extractedObjects.length}
                    {'\n'}safetyScore: {safetyScore}
                  </pre>
                </details>
              )}

              {/* No metadata yet */}
              {!hasAnyAiData && (
                <div className="bg-background-light rounded-lg p-4 text-center">
                  <Brain className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    {asset.status === 'processing'
                      ? 'AI metadata extraction in progress...'
                      : 'No AI metadata extracted yet.'}
                  </p>
                  {asset.status !== 'processing' && (
                    <button
                      onClick={handleTriggerExtraction}
                      disabled={extracting}
                      className="mt-3 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {extracting ? 'Extracting...' : 'Extract Metadata'}
                    </button>
                  )}
                </div>
              )}

              {/* AI Tags Section */}
              {asset.aiTags && asset.aiTags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    AI Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {asset.aiTags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript Section */}
              {asset.aiTranscript && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    Transcript
                  </h3>
                  <div className="bg-background-light rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{asset.aiTranscript}</p>
                  </div>
                </div>
              )}

              {/* Sentiment */}
              {asset.aiSentiment && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Sentiment</h3>
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    asset.aiSentiment === 'positive' ? 'bg-status-ready/15 text-status-ready' :
                    asset.aiSentiment === 'negative' ? 'bg-status-failed/15 text-status-failed' :
                    'bg-status-processing/15 text-status-processing'
                  }`}>
                    {asset.aiSentiment.charAt(0).toUpperCase() + asset.aiSentiment.slice(1)}
                  </div>
                </div>
              )}

              {/* Safety Score */}
              {asset.aiSafetyScore !== null && asset.aiSafetyScore !== undefined && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Content Safety Score
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-background-light rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          asset.aiSafetyScore >= 0.8 ? 'bg-status-ready' :
                          asset.aiSafetyScore >= 0.5 ? 'bg-status-processing' : 'bg-status-failed'
                        }`}
                        style={{ width: `${asset.aiSafetyScore * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">{Math.round(asset.aiSafetyScore * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Detected Objects */}
              {asset.aiObjects && Object.keys(asset.aiObjects).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Detected Objects</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(asset.aiObjects).map(([key, value]: [string, any]) => (
                      <span key={key} className="px-2 py-1 bg-status-processing/10 text-status-processing text-xs rounded-full">
                        {value.label || key}
                        {value.confidence && ` (${Math.round(value.confidence * 100)}%)`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Score (extracted from vision frames) */}
              {safetyScore !== null && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Content Safety Score
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-background-light rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          safetyScore >= 0.8 ? 'bg-status-ready' :
                          safetyScore >= 0.5 ? 'bg-status-processing' : 'bg-status-failed'
                        }`}
                        style={{ width: `${safetyScore * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">{Math.round(safetyScore * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Detected Objects (extracted from vision frames) */}
              {extractedObjects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Detected Objects</h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedObjects.map((obj: string) => (
                      <span key={obj} className="px-2 py-1 bg-status-processing/10 text-status-processing text-xs rounded-full capitalize">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vision Features */}
              {(extractedScenes.length > 0 || extractedColors.length > 0 || visionFeatures.frames?.length > 0) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Vision Analysis</h3>
                  <div className="bg-background-light rounded-lg p-3 space-y-2">
                    {extractedScenes.length > 0 && (
                      <div>
                        <p className="text-xs text-text-muted">Scenes Detected</p>
                        <p className="text-sm text-white">{extractedScenes.join(', ')}</p>
                      </div>
                    )}
                    {extractedColors.length > 0 && (
                      <div>
                        <p className="text-xs text-text-muted">Dominant Colors</p>
                        <div className="flex gap-1 mt-1">
                          {extractedColors.slice(0, 8).map((color: string, i: number) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded border border-background-hover"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {visionFeatures.frames && (
                      <div className="flex justify-between">
                        <span className="text-xs text-text-muted">Frames Analyzed</span>
                        <span className="text-sm text-white">{visionFeatures.frames.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audio Features */}
              {audioFeatures && Object.keys(audioFeatures).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Audio Analysis</h3>
                  <div className="bg-background-light rounded-lg p-3 space-y-2">
                    {audioFeatures.language && (
                      <div className="flex justify-between">
                        <span className="text-xs text-text-muted">Language</span>
                        <span className="text-sm text-white">{audioFeatures.language.toUpperCase()}</span>
                      </div>
                    )}
                    {audioFeatures.segments && Array.isArray(audioFeatures.segments) && (
                      <div className="flex justify-between">
                        <span className="text-xs text-text-muted">Speech Segments</span>
                        <span className="text-sm text-white">{audioFeatures.segments.length}</span>
                      </div>
                    )}
                    {audioFeatures.transcript && (
                      <div className="flex justify-between">
                        <span className="text-xs text-text-muted">Transcript Length</span>
                        <span className="text-sm text-white">{audioFeatures.transcript.length} chars</span>
                      </div>
                    )}
                    {audioFeatures.music_genres && (
                      <div>
                        <p className="text-xs text-text-muted">Music Genres</p>
                        <p className="text-sm text-white">{audioFeatures.music_genres.join(', ')}</p>
                      </div>
                    )}
                    {audioFeatures.speaker_count !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-xs text-text-muted">Speakers</span>
                        <span className="text-sm text-white">{audioFeatures.speaker_count}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NLP Features */}
              {nlpFeatures && Object.keys(nlpFeatures).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Text Analysis</h3>
                  <div className="bg-background-light rounded-lg p-3 space-y-2">
                    {nlpFeatures.language && (
                      <div className="flex justify-between">
                        <span className="text-xs text-text-muted">Language</span>
                        <span className="text-sm text-white">{nlpFeatures.language.toUpperCase()}</span>
                      </div>
                    )}
                    {nlpFeatures.topics && Array.isArray(nlpFeatures.topics) && nlpFeatures.topics.length > 0 && (
                      <div>
                        <p className="text-xs text-text-muted">Topics</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {nlpFeatures.topics.slice(0, 6).map((t: any, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded capitalize">
                              {t.label || t} {t.score ? `(${Math.round(t.score * 100)}%)` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {nlpFeatures.keywords && (
                      <div>
                        <p className="text-xs text-text-muted">Keywords</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {nlpFeatures.keywords.slice(0, 10).map((kw: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-background-hover text-text-secondary text-xs rounded">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {nlpFeatures.entities && Array.isArray(nlpFeatures.entities) && nlpFeatures.entities.length > 0 && (
                      <div>
                        <p className="text-xs text-text-muted">Named Entities</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {nlpFeatures.entities.slice(0, 8).map((e: any, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                              {e.text || e.label || e}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {nlpFeatures.summary && (
                      <div>
                        <p className="text-xs text-text-muted">Summary</p>
                        <p className="text-sm text-text-secondary mt-1 line-clamp-3">{nlpFeatures.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw AI Features (only if there's actual data that wasn't displayed above) */}
              {asset.aiFeatures && hasAnyAiData && !hasVisionData && !hasAudioData && !hasNlpData && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Raw Features</h3>
                  <div className="bg-background-light rounded-lg p-3">
                    <pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(asset.aiFeatures, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-4">
              <div className="bg-background-light rounded-lg p-4">
                <p className="text-sm text-text-muted">
                  Version history and file variants.
                </p>
              </div>
              {/* Current Version */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Current Version</p>
                    <p className="text-xs text-text-muted">Original upload</p>
                  </div>
                  <span className="px-2 py-1 bg-primary text-white text-xs rounded">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
