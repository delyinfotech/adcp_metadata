'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import UploadModal from '@/components/upload/UploadModal';

interface AppLayoutProps {
  children: React.ReactNode;
  onUploadComplete?: () => void;
}

export default function AppLayout({ children, onUploadComplete }: AppLayoutProps) {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock user data - replace with actual auth context
  const user = {
    name: 'Admin User',
    email: 'admin@demo.mediax.ai',
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    onUploadComplete?.();
    // Refresh the current page to show new uploads
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} onUploadClick={() => setShowUploadModal(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background-dark p-6">
          {children}
        </main>
      </div>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
