'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Asset, clearAuth, getStoredToken, getStoredUser, listAssets } from '@/lib/api';
import {
  TrendingUp,
  Upload,
  Clock,
  AlertCircle,
  Video,
  Image,
  Music,
  FileText,
  ArrowRight,
  CheckCircle,
  Activity,
  Zap,
  Users,
  Monitor,
  Server,
  Bot
} from 'lucide-react';

const pipelineStages = [
  { label: 'Ingest', value: 'Live', status: 'Streaming', note: 'MAM uploads active', icon: Upload },
  { label: 'AI Enrichment', value: 'Enabled', status: 'Healthy', note: 'Metadata layer', icon: Zap },
  { label: 'Compliance', value: 'Monitor', status: 'Manual', note: 'Review queue', icon: CheckCircle },
  { label: 'Distribution', value: 'Ready', status: 'Active', note: '12 endpoints', icon: Server },
];

const reviewQueue = [
  { title: 'OOH product montage', owner: 'Liu', deadline: 'Today 16:30' },
  { title: 'Campaign hero cut', owner: 'Maya', deadline: 'Tomorrow 09:00' },
  { title: 'Brand safety batch', owner: 'Ops', deadline: 'Tomorrow 11:45' },
];

const channelHealth = [
  { label: 'OTT partners', value: '8', detail: 'All green', color: 'text-status-ready' },
  { label: 'Broadcast feeds', value: '3', detail: 'Sync in 2h', color: 'text-status-processing' },
  { label: 'Retail screens', value: '156', detail: 'Nightly push', color: 'text-primary' },
];

const teamPulse = [
  { label: 'Editors online', value: '14', note: 'Peak shift to 19:00', icon: Users },
  { label: 'Reviewers', value: '6', note: 'Queue under 30 mins', icon: Monitor },
  { label: 'Automation bots', value: '12', note: 'Scaling with ingest', icon: Bot },
];

export default function Home() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
  }, []);

  const fetchAssets = useCallback(async () => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }
    try {
      const response = await listAssets({ limit: 30 });
      setAssets(response.data);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchAssets();
    } else {
      setLoading(false);
    }
  }, [fetchAssets, isAuthed]);

  const stats = useMemo(() => {
    const ready = assets.filter((asset) => asset.status === 'ready').length;
    const processing = assets.filter((asset) => asset.status === 'processing').length;
    const failed = assets.filter((asset) => asset.status === 'failed').length;
    const confidence = assets.length
      ? Math.min(
          99,
          Math.round(
            (assets.reduce((sum, asset) => sum + (asset.aiSafetyScore || 0), 0) /
              assets.length) *
              100,
          ),
        )
      : 0;

    return { ready, processing, failed, confidence, total: assets.length };
  }, [assets]);

  const priorityQueue = useMemo(() => {
    return assets.slice(0, 4).map((asset) => ({
      id: asset.id,
      title: asset.title || asset.filename,
      type: asset.assetType,
      status: asset.status,
      owner: asset.createdBy?.firstName || 'Team',
      tags: (asset.aiTags || []).slice(0, 3),
    }));
  }, [assets]);

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to GEN21 MediaX AI</h1>
          <p className="text-text-muted max-w-md mb-8">
            Intelligent Media Asset Management. Real-time ingest, AI enrichment, approvals,
            and distribution across all channels.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-background-light hover:bg-background-hover text-white rounded-lg text-sm font-medium transition-colors border border-background-hover"
            >
              Create Account
            </button>
          </div>
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
            <h1 className="text-2xl font-bold text-white">Control Desk</h1>
            <p className="text-text-muted mt-1">Real-time overview of your media operations</p>
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
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-sm text-text-muted">In your library</p>
          </div>

          <div className="bg-background-medium rounded-xl p-5 border border-background-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Ready</p>
                <p className="text-3xl font-bold text-status-ready mt-2">{stats.ready}</p>
              </div>
              <div className="w-12 h-12 bg-status-ready/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-status-ready" />
              </div>
            </div>
            <p className="mt-3 text-sm text-text-muted">Available for distribution</p>
          </div>

          <div className="bg-background-medium rounded-xl p-5 border border-background-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Processing</p>
                <p className="text-3xl font-bold text-status-processing mt-2">{stats.processing}</p>
              </div>
              <div className="w-12 h-12 bg-status-processing/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-status-processing" />
              </div>
            </div>
            <p className="mt-3 text-sm text-text-muted">Being analyzed by AI</p>
          </div>

          <div className="bg-background-medium rounded-xl p-5 border border-background-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">AI Confidence</p>
                <p className="text-3xl font-bold text-primary mt-2">{stats.confidence}%</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-sm text-text-muted">Metadata accuracy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Health */}
          <div className="lg:col-span-2 bg-background-medium rounded-xl p-6 border border-background-light">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Pipeline Health</h2>
              <span className="px-3 py-1 bg-status-ready/10 text-status-ready text-xs font-medium rounded-full">
                All Systems Operational
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.label}
                  className="bg-background-light rounded-lg p-4 border border-background-hover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <stage.icon className="w-5 h-5 text-primary" />
                    <span className="px-2 py-0.5 bg-status-ready/10 text-status-ready text-[10px] font-medium rounded">
                      {stage.status}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white">{stage.value}</p>
                  <p className="text-sm text-text-muted mt-1">{stage.label}</p>
                  <p className="text-xs text-text-muted mt-2">{stage.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Pulse */}
          <div className="bg-background-medium rounded-xl p-6 border border-background-light">
            <h2 className="text-lg font-semibold text-white mb-4">Team Pulse</h2>
            <div className="space-y-4">
              {teamPulse.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 bg-background-light rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.note}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets in Motion */}
          <div className="bg-background-medium rounded-xl p-6 border border-background-light">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Assets in Motion</h2>
              <Link href="/library" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {priorityQueue.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted">No assets in queue</p>
                <Link href="/library" className="text-primary text-sm mt-2 inline-block">
                  Upload your first asset
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {priorityQueue.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 bg-background-light rounded-lg hover:bg-background-hover transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background-hover rounded-lg flex items-center justify-center">
                        {asset.type === 'video' && <Video className="w-5 h-5 text-text-muted" />}
                        {asset.type === 'image' && <Image className="w-5 h-5 text-text-muted" />}
                        {asset.type === 'audio' && <Music className="w-5 h-5 text-text-muted" />}
                        {asset.type === 'document' && <FileText className="w-5 h-5 text-text-muted" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">{asset.title}</p>
                        <p className="text-xs text-text-muted">{asset.owner}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      asset.status === 'ready'
                        ? 'bg-status-ready/10 text-status-ready'
                        : asset.status === 'processing'
                        ? 'bg-status-processing/10 text-status-processing'
                        : 'bg-status-failed/10 text-status-failed'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Channel Readiness & Review Queue */}
          <div className="space-y-6">
            {/* Channel Readiness */}
            <div className="bg-background-medium rounded-xl p-6 border border-background-light">
              <h2 className="text-lg font-semibold text-white mb-4">Channel Readiness</h2>
              <div className="space-y-3">
                {channelHealth.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 bg-background-light rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.detail}</p>
                    </div>
                    <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Queue */}
            <div className="bg-background-medium rounded-xl p-6 border border-background-light">
              <h2 className="text-lg font-semibold text-white mb-4">Review Queue</h2>
              <div className="space-y-3">
                {reviewQueue.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-3 bg-background-light rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-text-muted">{item.owner}</p>
                    </div>
                    <span className="text-xs text-status-processing">{item.deadline}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
