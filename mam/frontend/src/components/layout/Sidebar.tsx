'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Image,
  Folders,
  Star,
  Search,
  Upload,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Library', href: '/library', icon: FolderOpen },
  { name: 'Assets', href: '/assets', icon: Image },
  { name: 'Folders', href: '/folders', icon: Folders },
  { name: 'Collections', href: '/collections', icon: Star },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Upload', href: '/upload', icon: Upload },
];

const secondaryNavigation = [
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-60'
      } bg-background-medium h-screen flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-background-light">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img src="/gen21-logo.png" alt="GEN21" className="h-6" />
            <span className="font-heading font-semibold text-sm text-text-muted">MediaX AI</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">G</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-background-light text-white border-l-[3px] border-primary'
                      : 'text-text-secondary hover:bg-background-hover hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 px-2">
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Admin
            </p>
          )}
          <ul className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-background-light text-white border-l-[3px] border-primary'
                        : 'text-text-secondary hover:bg-background-hover hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-background-light">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:bg-background-hover hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
