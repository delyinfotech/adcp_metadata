'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getStoredToken } from '@/lib/api';
import {
  User, Bell, Shield, Palette, Globe, Key, HardDrive,
  Building, Users, CreditCard, Save, Camera, Mail, Phone
} from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance' | 'storage' | 'organization';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'organization', label: 'Organization', icon: Building },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
  }, []);

  // Profile settings state
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@demo.mediax.ai',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York',
    language: 'en',
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailUploads: true,
    emailDownloads: false,
    emailComments: true,
    emailWorkflows: true,
    pushEnabled: true,
    digestFrequency: 'daily',
  });

  // Appearance settings state
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    defaultView: 'grid',
    thumbnailSize: 'medium',
    showMetadata: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-text-muted mb-4">Please log in to access settings.</p>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">AU</span>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white hover:bg-primary-hover">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full h-10 pl-10 pr-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full h-10 pl-10 pr-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Timezone</label>
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                        className="w-full h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">GMT</option>
                        <option value="Asia/Tokyo">Japan (JST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Language</label>
                      <select
                        value={profile.language}
                        onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                        className="w-full h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
              <div className="space-y-3">
                {[
                  { key: 'emailUploads', label: 'Asset uploads', desc: 'When new assets are uploaded' },
                  { key: 'emailDownloads', label: 'Asset downloads', desc: 'When your assets are downloaded' },
                  { key: 'emailComments', label: 'Comments', desc: 'When someone comments on your assets' },
                  { key: 'emailWorkflows', label: 'Workflow updates', desc: 'When workflow status changes' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-background-light rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications] as boolean}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-background-hover rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Digest Frequency</h3>
              <select
                value={notifications.digestFrequency}
                onChange={(e) => setNotifications({ ...notifications, digestFrequency: e.target.value })}
                className="w-full max-w-xs h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="realtime">Real-time</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Password</h3>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium">
                  Update Password
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
              <div className="p-4 bg-background-light rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-status-failed/10 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-status-failed" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">2FA is disabled</p>
                    <p className="text-xs text-text-muted">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-background-hover hover:bg-background-medium text-white rounded-lg text-sm font-medium">
                  Enable 2FA
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
              <div className="space-y-2">
                {[
                  { device: 'Chrome on Windows', location: 'New York, US', current: true },
                  { device: 'Safari on MacOS', location: 'San Francisco, US', current: false },
                ].map((session, i) => (
                  <div key={i} className="p-4 bg-background-light rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{session.device}</p>
                      <p className="text-xs text-text-muted">{session.location}</p>
                    </div>
                    {session.current ? (
                      <span className="px-2 py-1 bg-status-ready/20 text-status-ready text-xs rounded">Current</span>
                    ) : (
                      <button className="text-xs text-status-failed hover:underline">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4 max-w-lg">
                {['dark', 'light', 'system'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setAppearance({ ...appearance, theme })}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      appearance.theme === theme
                        ? 'border-primary bg-primary/10'
                        : 'border-background-light hover:border-background-hover'
                    }`}
                  >
                    <div className={`w-full h-16 rounded mb-2 ${
                      theme === 'dark' ? 'bg-background-dark' :
                      theme === 'light' ? 'bg-gray-100' : 'bg-gradient-to-r from-background-dark to-gray-100'
                    }`} />
                    <p className="text-sm font-medium text-white capitalize">{theme}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Default View</h3>
              <div className="flex gap-4">
                {['grid', 'list'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setAppearance({ ...appearance, defaultView: view })}
                    className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                      appearance.defaultView === view
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-background-light text-text-muted hover:text-white'
                    }`}
                  >
                    <span className="capitalize">{view} View</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Thumbnail Size</h3>
              <select
                value={appearance.thumbnailSize}
                onChange={(e) => setAppearance({ ...appearance, thumbnailSize: e.target.value })}
                className="w-full max-w-xs h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Storage Usage</h3>
              <div className="p-6 bg-background-light rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-white">2.4 TB</p>
                    <p className="text-sm text-text-muted">of 5 TB used</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-status-ready">48%</p>
                    <p className="text-xs text-text-muted">capacity used</p>
                  </div>
                </div>
                <div className="h-3 bg-background-hover rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '48%' }} />
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[
                    { type: 'Videos', size: '1.8 TB', color: 'primary' },
                    { type: 'Images', size: '450 GB', color: 'status-ready' },
                    { type: 'Audio', size: '120 GB', color: 'status-processing' },
                    { type: 'Other', size: '30 GB', color: 'text-muted' },
                  ].map((item) => (
                    <div key={item.type} className="text-center">
                      <div className={`w-3 h-3 bg-${item.color} rounded-full mx-auto mb-1`} />
                      <p className="text-xs text-text-muted">{item.type}</p>
                      <p className="text-sm font-medium text-white">{item.size}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Storage Plan</h3>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Enterprise Plan</p>
                  <p className="text-xs text-text-muted">5 TB storage • Unlimited users</p>
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Organization Details</h3>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Demo Organization"
                    className="w-full h-10 px-4 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Subdomain</label>
                  <div className="flex">
                    <input
                      type="text"
                      defaultValue="demo"
                      className="flex-1 h-10 px-4 bg-background-light border border-background-hover rounded-l-lg text-white text-sm focus:outline-none focus:border-primary"
                    />
                    <span className="h-10 px-4 bg-background-hover border border-l-0 border-background-hover rounded-r-lg flex items-center text-sm text-text-muted">
                      .mediax.ai
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Billing</h3>
              <div className="p-4 bg-background-light rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-8 h-8 text-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-white">Visa ending in 4242</p>
                    <p className="text-xs text-text-muted">Expires 12/2025</p>
                  </div>
                </div>
                <button className="text-sm text-primary hover:text-primary-hover">
                  Update payment method
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
              <div className="flex items-center justify-between p-4 bg-background-light rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-white">6 team members</p>
                    <p className="text-xs text-text-muted">4 active, 1 invited, 1 inactive</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/team')}
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Manage Team
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AppLayout>
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Settings Navigation */}
        <div className="w-64 bg-background-medium rounded-xl border border-background-light p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-background-light hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-background-medium rounded-xl border border-background-light p-6 overflow-y-auto">
          {renderTabContent()}

          {/* Save Button */}
          <div className="mt-8 pt-4 border-t border-background-light">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
