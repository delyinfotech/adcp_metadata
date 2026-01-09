'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getStoredToken, listAssets } from '@/lib/api';
import { TrendingUp, Upload, Clock, AlertCircle, Video, Image, Music, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalAssets: number;
  videosCount: number;
  imagesCount: number;
  audioCount: number;
  documentsCount: number;
  processingCount: number;
  readyCount: number;
  failedCount: number;
  recentUploads: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    videosCount: 0,
    imagesCount: 0,
    audioCount: 0,
    documentsCount: 0,
    processingCount: 0,
    readyCount: 0,
    failedCount: 0,
    recentUploads: 0,
  });

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));

    if (token) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await listAssets({ limit: 100 });
      const assets = response.data;

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      setStats({
        totalAssets: assets.length,
        videosCount: assets.filter((a) => a.assetType === 'video').length,
        imagesCount: assets.filter((a) => a.assetType === 'image').length,
        audioCount: assets.filter((a) => a.assetType === 'audio').length,
        documentsCount: assets.filter((a) => a.assetType === 'document').length,
        processingCount: assets.filter((a) => a.status === 'processing').length,
        readyCount: assets.filter((a) => a.status === 'ready').length,
        failedCount: assets.filter((a) => a.status === 'failed').length,
        recentUploads: assets.filter((a) => new Date(a.createdAt) > last24h).length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 bg-background-light rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Welcome to GEN21 MediaX AI</h2>
          <p className="text-text-muted mb-6">Please log in to access your dashboard.</p>
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
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-text-muted mt-1">Welcome back! Here's an overview of your media library.</p>
          </div>
          <Link
            href="/library"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary/20"
          >
            <Upload className="w-4 h-4" />
            Upload Assets
          </Link>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-background-medium rounded-xl p-5 border border-background-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Assets</p>
                <p className="text-3xl font-bold text-white mt-2">{loading ? '-' : stats.totalAssets}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <span className="text-status-ready">+{stats.recentUploads}</span>
              <span className="text-text-muted">in last 24h</span>
            </div>
          </div>

          <div className="bg-background-medium rounded-xl p-5 border border-background-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Ready</p>
                <p className="text-3xl font-bold text-status-ready mt-2">{loading ? '-' : stats.readyCount}</p>
              </div>
              <div className="w-12 h-12 bg-status-ready/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-status-ready" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-sm text-text-muted">Available for use</p>
          </div>

          <div className="bg-background-medium rounded-xl p-5 border border-background-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Processing</p>
                <p className="text-3xl font-bold text-status-processing mt-2">{loading ? '-' : stats.processingCount}</p>
              </div>
              <div className="w-12 h-12 bg-status-processing/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-status-processing" />
              </div>
            </div>
            <p className="mt-3 text-sm text-text-muted">Being analyzed</p>
          </div>

          <div className="bg-background-medium rounded-xl p-5 border border-background-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Failed</p>
                <p className="text-3xl font-bold text-status-failed mt-2">{loading ? '-' : stats.failedCount}</p>
              </div>
              <div className="w-12 h-12 bg-status-failed/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-status-failed" />
              </div>
            </div>
            <p className="mt-3 text-sm text-text-muted">Need attention</p>
          </div>
        </div>

        {/* Asset Types Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-background-medium rounded-xl p-6 border border-background-light">
            <h2 className="text-lg font-semibold text-white mb-4">Asset Types</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Videos</p>
                    <p className="text-xs text-text-muted">MP4, MOV, AVI, MKV</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{stats.videosCount}</p>
                  <p className="text-xs text-text-muted">
                    {stats.totalAssets > 0 ? Math.round((stats.videosCount / stats.totalAssets) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Images</p>
                    <p className="text-xs text-text-muted">JPG, PNG, GIF, WebP</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{stats.imagesCount}</p>
                  <p className="text-xs text-text-muted">
                    {stats.totalAssets > 0 ? Math.round((stats.imagesCount / stats.totalAssets) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Audio</p>
                    <p className="text-xs text-text-muted">MP3, WAV, AAC, FLAC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{stats.audioCount}</p>
                  <p className="text-xs text-text-muted">
                    {stats.totalAssets > 0 ? Math.round((stats.audioCount / stats.totalAssets) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Documents</p>
                    <p className="text-xs text-text-muted">PDF, DOC, XLS, PPT</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{stats.documentsCount}</p>
                  <p className="text-xs text-text-muted">
                    {stats.totalAssets > 0 ? Math.round((stats.documentsCount / stats.totalAssets) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background-medium rounded-xl p-6 border border-background-light">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/library"
                className="flex items-center justify-between p-4 bg-background-light rounded-lg hover:bg-background-hover transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Upload New Assets</p>
                    <p className="text-xs text-text-muted">Add media files to your library</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/library"
                className="flex items-center justify-between p-4 bg-background-light rounded-lg hover:bg-background-hover transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-status-processing/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-status-processing" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">View Processing Queue</p>
                    <p className="text-xs text-text-muted">{stats.processingCount} assets being processed</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/library"
                className="flex items-center justify-between p-4 bg-background-light rounded-lg hover:bg-background-hover transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-status-failed/10 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-status-failed" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Review Failed Items</p>
                    <p className="text-xs text-text-muted">{stats.failedCount} items need attention</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="bg-gradient-to-r from-primary/10 to-status-processing/10 rounded-xl p-6 border border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">AI-Powered Features</h2>
              <p className="text-text-muted mt-1 max-w-xl">
                Your media assets are automatically analyzed using advanced AI for metadata extraction,
                content tagging, transcription, and more.
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-background-dark/50 rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{stats.readyCount}</p>
              <p className="text-xs text-text-muted mt-1">Assets with AI tags</p>
            </div>
            <div className="bg-background-dark/50 rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{stats.videosCount + stats.audioCount}</p>
              <p className="text-xs text-text-muted mt-1">Transcribed</p>
            </div>
            <div className="bg-background-dark/50 rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{stats.imagesCount}</p>
              <p className="text-xs text-text-muted mt-1">Visual analysis</p>
            </div>
            <div className="bg-background-dark/50 rounded-lg p-4">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-text-muted mt-1">Metadata extracted</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
