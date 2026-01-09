'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import AssetGrid from '@/components/assets/AssetGrid';
import AssetDetailPanel from '@/components/assets/AssetDetailPanel';
import { Asset as ApiAsset, deleteAsset, getDownloadUrl, getStoredToken, listAssets } from '@/lib/api';
import { Asset } from '@/components/assets/AssetCard';
import { Video, Image, Music, FileText, Loader2 } from 'lucide-react';

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

const assetTypeFilters = [
  { id: 'all', label: 'All Assets', icon: null },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'document', label: 'Documents', icon: FileText },
];

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
    if (!token) setLoading(false);
  }, []);

  const fetchAssets = useCallback(async () => {
    if (!getStoredToken()) return;
    setLoading(true);
    try {
      const response = await listAssets({ limit: 100 });
      setAssets(response.data.map(transformAsset));
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) fetchAssets();
  }, [fetchAssets, isAuthed]);

  const filteredAssets = activeFilter === 'all'
    ? assets
    : assets.filter(a => a.assetType === activeFilter);

  const handleBulkDelete = async (assetIds: string[]) => {
    try {
      for (const id of assetIds) {
        await deleteAsset(id);
      }
      await fetchAssets();
      if (selectedAsset && assetIds.includes(selectedAsset.id)) {
        setSelectedAsset(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleBulkDownload = async (assetIds: string[]) => {
    try {
      for (const id of assetIds) {
        const result = await getDownloadUrl(id);
        window.open(result.url, '_blank');
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const assetCounts = {
    all: assets.length,
    video: assets.filter(a => a.assetType === 'video').length,
    image: assets.filter(a => a.assetType === 'image').length,
    audio: assets.filter(a => a.assetType === 'audio').length,
    document: assets.filter(a => a.assetType === 'document').length,
  };

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-text-muted mb-4">Please log in to view assets.</p>
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
        <div>
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="text-text-muted mt-1">Browse all media assets by type</p>
        </div>

        {/* Asset Type Tabs */}
        <div className="flex gap-2 border-b border-background-light pb-4">
          {assetTypeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? 'bg-primary text-white'
                  : 'bg-background-medium text-text-secondary hover:bg-background-light hover:text-white'
              }`}
            >
              {filter.icon && <filter.icon className="w-4 h-4" />}
              {filter.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                activeFilter === filter.id ? 'bg-white/20' : 'bg-background-light'
              }`}>
                {assetCounts[filter.id as keyof typeof assetCounts]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <AssetGrid
            assets={filteredAssets}
            onAssetClick={setSelectedAsset}
            onBulkDelete={handleBulkDelete}
            onBulkDownload={handleBulkDownload}
          />
        )}
      </div>

      {selectedAsset && (
        <AssetDetailPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onRefresh={() => {
            fetchAssets();
            // Re-fetch selected asset details
            if (selectedAsset) {
              const updatedAsset = assets.find(a => a.id === selectedAsset.id);
              if (updatedAsset) setSelectedAsset(updatedAsset);
            }
          }}
        />
      )}
    </AppLayout>
  );
}
