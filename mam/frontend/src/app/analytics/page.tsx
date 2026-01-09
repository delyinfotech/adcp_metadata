'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getStoredToken } from '@/lib/api';
import {
  BarChart3, TrendingUp, TrendingDown, HardDrive, Eye, Download,
  Upload, Users, Clock, Calendar, FileVideo, FileImage, FileAudio,
  FileText, Activity, Zap
} from 'lucide-react';

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

const overviewStats: StatCard[] = [
  { label: 'Total Assets', value: '1,234', change: 12.5, icon: BarChart3, color: 'primary' },
  { label: 'Storage Used', value: '2.4 TB', change: 8.3, icon: HardDrive, color: 'status-processing' },
  { label: 'Total Views', value: '45.2K', change: 23.1, icon: Eye, color: 'status-ready' },
  { label: 'Downloads', value: '3,456', change: -5.2, icon: Download, color: 'status-failed' },
];

const assetTypeBreakdown = [
  { type: 'Videos', count: 456, size: '1.8 TB', percentage: 75, icon: FileVideo, color: 'bg-primary' },
  { type: 'Images', count: 567, size: '450 GB', percentage: 18, icon: FileImage, color: 'bg-status-ready' },
  { type: 'Audio', count: 123, size: '120 GB', percentage: 5, icon: FileAudio, color: 'bg-status-processing' },
  { type: 'Documents', count: 88, size: '30 GB', percentage: 2, icon: FileText, color: 'bg-status-failed' },
];

const recentActivity = [
  { action: 'Asset uploaded', asset: 'product_launch_v3.mp4', user: 'M. Abrar', time: '5 min ago' },
  { action: 'Asset downloaded', asset: 'brand_guidelines.pdf', user: 'Zacky', time: '12 min ago' },
  { action: 'Collection created', asset: 'Q1 Marketing', user: 'Robi', time: '1 hour ago' },
  { action: 'Asset transcoded', asset: 'interview_raw.mov', user: 'Dely', time: '2 hours ago' },
  { action: 'Metadata extracted', asset: 'beach_sunset.jpg', user: 'AI Engine', time: '3 hours ago' },
];

const topAssets = [
  { name: 'Product Launch Video', views: 1234, downloads: 89, type: 'video' },
  { name: 'Brand Guidelines 2024', views: 987, downloads: 234, type: 'document' },
  { name: 'Team Photo Collection', views: 756, downloads: 45, type: 'image' },
  { name: 'Podcast Episode 12', views: 543, downloads: 123, type: 'audio' },
  { name: 'Customer Testimonial', views: 432, downloads: 67, type: 'video' },
];

const processingStats = {
  completed: 1156,
  processing: 23,
  queued: 45,
  failed: 10,
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
  }, []);

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-text-muted mb-4">Please log in to view analytics.</p>
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
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-text-muted mt-1">Track asset performance and usage metrics</p>
          </div>
          <div className="flex items-center gap-2 bg-background-medium rounded-lg border border-background-light p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4">
          {overviewStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-background-medium rounded-xl p-4 border border-background-light"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.change >= 0 ? 'text-status-ready' : 'text-status-failed'
                }`}>
                  {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Asset Type Breakdown */}
          <div className="bg-background-medium rounded-xl border border-background-light p-4">
            <h3 className="font-semibold text-white mb-4">Storage by Type</h3>
            <div className="space-y-4">
              {assetTypeBreakdown.map((item) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-text-muted" />
                      <span className="text-text-secondary">{item.type}</span>
                    </div>
                    <span className="text-white font-medium">{item.size}</span>
                  </div>
                  <div className="h-2 bg-background-light rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>{item.count} assets</span>
                    <span>{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Processing Stats */}
          <div className="bg-background-medium rounded-xl border border-background-light p-4">
            <h3 className="font-semibold text-white mb-4">Processing Pipeline</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-status-ready/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-status-ready">{processingStats.completed}</p>
                  <p className="text-xs text-text-muted">Completed</p>
                </div>
                <div className="bg-status-processing/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-status-processing">{processingStats.processing}</p>
                  <p className="text-xs text-text-muted">Processing</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{processingStats.queued}</p>
                  <p className="text-xs text-text-muted">Queued</p>
                </div>
                <div className="bg-status-failed/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-status-failed">{processingStats.failed}</p>
                  <p className="text-xs text-text-muted">Failed</p>
                </div>
              </div>
              <div className="pt-3 border-t border-background-light">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-status-processing" />
                  <span className="text-text-muted">AI metadata extraction</span>
                  <span className="ml-auto text-status-ready font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Assets */}
          <div className="bg-background-medium rounded-xl border border-background-light p-4">
            <h3 className="font-semibold text-white mb-4">Top Assets</h3>
            <div className="space-y-3">
              {topAssets.map((asset, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-light transition-colors">
                  <span className="text-lg font-bold text-text-muted w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                    <p className="text-xs text-text-muted">{asset.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{asset.views.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart Placeholder & Recent Activity */}
        <div className="grid grid-cols-2 gap-6">
          {/* Activity Chart */}
          <div className="bg-background-medium rounded-xl border border-background-light p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Activity Overview</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-text-muted">Uploads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-status-ready" />
                  <span className="text-text-muted">Downloads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-status-processing" />
                  <span className="text-text-muted">Views</span>
                </div>
              </div>
            </div>
            {/* Chart placeholder */}
            <div className="h-48 flex items-end gap-2 px-4">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1">
                  <div
                    className="bg-primary/60 rounded-t"
                    style={{ height: `${height * 0.6}%` }}
                  />
                  <div
                    className="bg-status-ready/60 rounded-t"
                    style={{ height: `${height * 0.3}%` }}
                  />
                  <div
                    className="bg-status-processing/60 rounded-t"
                    style={{ height: `${height * 0.1}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-text-muted px-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-background-medium rounded-xl border border-background-light p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Recent Activity</h3>
              <button className="text-xs text-primary hover:text-primary-hover">View All</button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-background-light transition-colors">
                  <div className="w-8 h-8 bg-background-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.action}</span>
                    </p>
                    <p className="text-xs text-text-muted truncate">{activity.asset}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-text-secondary">{activity.user}</p>
                    <p className="text-xs text-text-muted">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-background-medium rounded-xl border border-background-light p-4">
          <h3 className="font-semibold text-white mb-4">Team Activity</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'Robi', uploads: 45, downloads: 23, role: 'Admin' },
              { name: 'M. Abrar', uploads: 32, downloads: 56, role: 'Creator' },
              { name: 'Zacky', uploads: 12, downloads: 89, role: 'Creator' },
              { name: 'Dely', uploads: 28, downloads: 17, role: 'Creator' },
            ].map((user, i) => (
              <div key={i} className="bg-background-light rounded-lg p-4 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-text-muted mb-2">{user.role}</p>
                <div className="flex justify-center gap-4 text-xs">
                  <div>
                    <p className="text-white font-medium">{user.uploads}</p>
                    <p className="text-text-muted">uploads</p>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.downloads}</p>
                    <p className="text-text-muted">downloads</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
