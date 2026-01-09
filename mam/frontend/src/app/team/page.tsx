'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getStoredToken } from '@/lib/api';
import { Users, UserPlus, Mail, Shield, MoreVertical, Search, Edit, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'creator' | 'reviewer' | 'viewer';
  avatar?: string;
  status: 'active' | 'invited' | 'inactive';
  lastActive?: string;
}

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Robi', email: 'robi@infotech.co.id', role: 'admin', status: 'active', lastActive: 'Just now' },
  { id: '2', name: 'M. Abrar', email: 'abrar@infotech.co.id', role: 'creator', status: 'active', lastActive: '1 hour ago' },
  { id: '3', name: 'Zacky', email: 'zacky@infotech.co.id', role: 'creator', status: 'active', lastActive: '2 hours ago' },
  { id: '4', name: 'Dely', email: 'dely@infotech.co.id', role: 'creator', status: 'active', lastActive: '3 hours ago' },
];

const roleColors = {
  admin: 'bg-status-failed/20 text-status-failed',
  manager: 'bg-primary/20 text-primary',
  creator: 'bg-status-processing/20 text-status-processing',
  reviewer: 'bg-status-ready/20 text-status-ready',
  viewer: 'bg-background-light text-text-muted',
};

const rolePermissions = {
  admin: 'Full access to all features',
  manager: 'Manage assets, workflows, and team',
  creator: 'Upload, edit, delete own assets',
  reviewer: 'View, comment, approve workflows',
  viewer: 'View and download assets',
};

export default function TeamPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
  }, []);

  const filteredMembers = mockTeamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-text-muted mb-4">Please log in to manage team.</p>
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
            <h1 className="text-2xl font-bold text-white">Team</h1>
            <p className="text-text-muted mt-1">Manage team members and permissions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-sm font-medium transition-colors">
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background-medium rounded-xl p-4 border border-background-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockTeamMembers.length}</p>
                <p className="text-sm text-text-muted">Total Members</p>
              </div>
            </div>
          </div>
          <div className="bg-background-medium rounded-xl p-4 border border-background-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-status-ready/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-status-ready" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockTeamMembers.filter(m => m.status === 'active').length}</p>
                <p className="text-sm text-text-muted">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-background-medium rounded-xl p-4 border border-background-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-status-processing/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-status-processing" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockTeamMembers.filter(m => m.status === 'invited').length}</p>
                <p className="text-sm text-text-muted">Invited</p>
              </div>
            </div>
          </div>
          <div className="bg-background-medium rounded-xl p-4 border border-background-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-status-failed/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-status-failed" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockTeamMembers.filter(m => m.role === 'admin').length}</p>
                <p className="text-sm text-text-muted">Admins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-10 pl-10 pr-4 bg-background-medium border border-background-light rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="h-10 px-4 bg-background-medium border border-background-light rounded-lg text-white text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="creator">Creator</option>
            <option value="reviewer">Reviewer</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {/* Team Members Table */}
        <div className="bg-background-medium rounded-xl border border-background-light overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-background-light">
                <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Member</th>
                <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Role</th>
                <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="p-4 text-left text-xs font-medium text-text-muted uppercase">Last Active</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-background-light hover:bg-background-light">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        <p className="text-xs text-text-muted">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[member.role]}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      <p className="text-xs text-text-muted mt-1">{rolePermissions[member.role]}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.status === 'active' ? 'bg-status-ready/20 text-status-ready' :
                      member.status === 'invited' ? 'bg-status-processing/20 text-status-processing' :
                      'bg-background-light text-text-muted'
                    }`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-muted">
                    {member.lastActive || 'Pending'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-background-hover rounded text-text-muted hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-background-hover rounded text-text-muted hover:text-error">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
