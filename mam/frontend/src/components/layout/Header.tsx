'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Upload, Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { clearAuth } from '@/lib/api';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onUploadClick?: () => void;
  onNotificationClick?: () => void;
}

export default function Header({ user, onUploadClick, onNotificationClick }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-background-dark border-b border-background-light flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search assets, tags, metadata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-background-medium border border-background-light rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary/20"
        >
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              onNotificationClick?.();
            }}
            className="relative p-2 text-text-secondary hover:text-white hover:bg-background-hover rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-background-medium border border-background-light rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-background-light flex items-center justify-between">
                <p className="text-sm font-medium text-white">Notifications</p>
                <button className="text-xs text-primary hover:text-primary-hover">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No new notifications</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 hover:bg-background-hover rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-background-medium border border-background-light rounded-lg shadow-xl py-1 z-50">
              <div className="px-4 py-3 border-b border-background-light">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-text-muted">{user?.email || 'user@example.com'}</p>
              </div>
              <div className="py-1">
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-background-hover transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-background-hover transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
