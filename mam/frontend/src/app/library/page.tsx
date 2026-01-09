'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import AssetGrid from '@/components/assets/AssetGrid';
import AssetDetailPanel from '@/components/assets/AssetDetailPanel';
import { Asset as ApiAsset } from '@/lib/api';
import { Asset } from '@/components/assets/AssetCard';
import {
  clearAuth,
  deleteAsset,
  getDownloadUrl,
  getStoredToken,
  getStoredUser,
  listAssets,
  triggerExtraction,
  uploadAsset,
} from '@/lib/api';
import { RefreshCw, Download, Loader2 } from 'lucide-react';

// Transform API asset to component asset format
function transformAsset(apiAsset: ApiAsset): Asset {
  return {
    id: apiAsset.id,
    title: apiAsset.title || apiAsset.filename,
    filename: apiAsset.filename,
    assetType: apiAsset.assetType as Asset['assetType'],
    mimeType: apiAsset.mimeType,
    fileSize: typeof apiAsset.fileSize === 'string' ? parseInt(apiAsset.fileSize, 10) : apiAsset.fileSize,
    status: apiAsset.status as Asset['status'],
    cdnUrl: apiAsset.cdnUrl,
    thumbnailUrl: apiAsset.thumbnailUrl,
    duration: apiAsset.duration,
    width: apiAsset.width,
    height: apiAsset.height,
    aiTags: apiAsset.aiTags || [],
    aiObjects: apiAsset.aiObjects,
    aiFaces: apiAsset.aiFaces,
    aiTranscript: apiAsset.aiTranscript,
    aiSentiment: apiAsset.aiSentiment,
    aiSafetyScore: apiAsset.aiSafetyScore,
    aiFeatures: apiAsset.aiFeatures,
    processingProgress: apiAsset.processingProgress,
    createdAt: apiAsset.createdAt || new Date().toISOString(),
  };
}

export default function LibraryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
  }, []);

  const fetchAssets = useCallback(async () => {
    if (!getStoredToken()) return;
    setLoading(true);
    setError('');
    try {
      const response = await listAssets({ limit: 48 });
      const transformedAssets = response.data.map(transformAsset);
      setAssets(transformedAssets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchAssets();
    }
  }, [fetchAssets, isAuthed]);

  // Auto-refresh when processing assets exist (5 second interval for better UX)
  useEffect(() => {
    if (!isAuthed) return;
    const hasProcessing = assets.some((asset) => asset.status === 'processing');
    if (!hasProcessing) return;
    const interval = setInterval(fetchAssets, 5000);
    return () => clearInterval(interval);
  }, [assets, fetchAssets, isAuthed]);

  // Keep selectedAsset in sync with assets list
  useEffect(() => {
    if (selectedAsset) {
      const updatedAsset = assets.find((a) => a.id === selectedAsset.id);
      if (updatedAsset && JSON.stringify(updatedAsset) !== JSON.stringify(selectedAsset)) {
        setSelectedAsset(updatedAsset);
      }
    }
  }, [assets, selectedAsset]);

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleCloseDetail = () => {
    setSelectedAsset(null);
  };

  const handleUpload = async (file: File) => {
    setActionBusy(true);
    setError('');
    try {
      const apiAsset = await uploadAsset(file, file.name);
      const newAsset = transformAsset(apiAsset);
      setAssets((prev) => [newAsset, ...prev]);
      setSelectedAsset(newAsset);
      // Quick refresh after 3 seconds to catch fast extractions
      setTimeout(() => fetchAssets(), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleUploadComplete = async (files: File[]) => {
    for (const file of files) {
      await handleUpload(file);
    }
  };

  const handleDownload = async (asset: Asset) => {
    setActionBusy(true);
    setError('');
    try {
      const response = await getDownloadUrl(asset.id);
      window.open(response.url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleExtraction = async (asset: Asset) => {
    setActionBusy(true);
    setError('');
    try {
      await triggerExtraction(asset.id, { force: true });
      await fetchAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction trigger failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleBulkDelete = async (assetIds: string[]) => {
    setActionBusy(true);
    setError('');
    try {
      for (const id of assetIds) {
        await deleteAsset(id);
      }
      await fetchAssets();
      if (selectedAsset && assetIds.includes(selectedAsset.id)) {
        setSelectedAsset(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setActionBusy(false);
    }
  };

  const handleBulkDownload = async (assetIds: string[]) => {
    setError('');
    try {
      for (const id of assetIds) {
        const result = await getDownloadUrl(id);
        window.open(result.url, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  // Calculate stats
  const stats = useMemo(() => ({
    total: assets.length,
    videos: assets.filter((a) => a.assetType === 'video').length,
    images: assets.filter((a) => a.assetType === 'image').length,
    processing: assets.filter((a) => a.status === 'processing').length,
    ready: assets.filter((a) => a.status === 'ready').length,
    failed: assets.filter((a) => a.status === 'failed').length,
  }), [assets]);

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 bg-background-light rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-text-muted mb-6">Please log in to access the media library.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout onUploadComplete={fetchAssets}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Media Library</h1>
            <p className="text-text-muted mt-1">
              {loading ? 'Loading assets...' : `${assets.length} assets in your library`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAssets}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-background-medium hover:bg-background-light border border-background-light text-text-secondary hover:text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-status-failed/10 border border-status-failed/20 rounded-lg text-status-failed text-sm">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-background-medium rounded-lg p-4 border border-background-light">
            <p className="text-sm text-text-muted">Total Assets</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-background-medium rounded-lg p-4 border border-background-light">
            <p className="text-sm text-text-muted">Videos</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.videos}</p>
          </div>
          <div className="bg-background-medium rounded-lg p-4 border border-background-light">
            <p className="text-sm text-text-muted">Images</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.images}</p>
          </div>
          <div className="bg-background-medium rounded-lg p-4 border border-background-light">
            <p className="text-sm text-text-muted">Ready</p>
            <p className="text-2xl font-bold text-status-ready mt-1">{stats.ready}</p>
          </div>
          <div className="bg-background-medium rounded-lg p-4 border border-background-light">
            <p className="text-sm text-text-muted">Processing</p>
            <p className="text-2xl font-bold text-status-processing mt-1">{stats.processing}</p>
          </div>
          <div className="bg-background-medium rounded-lg p-4 border border-background-light">
            <p className="text-sm text-text-muted">Failed</p>
            <p className="text-2xl font-bold text-status-failed mt-1">{stats.failed}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-text-muted">Loading your assets...</p>
          </div>
        )}

        {/* Asset Grid */}
        {!loading && assets.length > 0 && (
          <AssetGrid
            assets={assets}
            onAssetClick={handleAssetClick}
            onBulkDelete={handleBulkDelete}
            onBulkDownload={handleBulkDownload}
          />
        )}

        {/* Empty State */}
        {!loading && assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-background-medium rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No assets yet</h3>
            <p className="text-sm text-text-muted max-w-sm">
              Click the <span className="text-primary font-medium">Upload</span> button in the top right corner to get started.
            </p>
          </div>
        )}
      </div>

      {/* Asset Detail Panel */}
      {selectedAsset && (
        <AssetDetailPanel
          asset={selectedAsset}
          onClose={handleCloseDetail}
          onRefresh={fetchAssets}
          onEdit={(asset) => {
            console.log('Edit:', asset);
            handleExtraction(asset);
          }}
          onDelete={(asset) => {
            console.log('Delete:', asset);
          }}
        />
      )}

    </AppLayout>
  );
}
