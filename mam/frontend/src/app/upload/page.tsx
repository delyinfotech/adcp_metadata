'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getStoredToken, uploadAsset } from '@/lib/api';
import { Cloud, Upload, File, CheckCircle, XCircle, Loader2, X, FolderOpen } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('root');
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthed(Boolean(token));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    setIsUploading(true);

    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue;

      setFiles((prev) =>
        prev.map((f) => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
      );

      try {
        // Simulate progress
        for (let progress = 0; progress <= 90; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setFiles((prev) =>
            prev.map((f) => f.id === uploadFile.id ? { ...f, progress } : f)
          );
        }

        await uploadAsset(uploadFile.file, uploadFile.file.name);

        setFiles((prev) =>
          prev.map((f) => f.id === uploadFile.id ? { ...f, status: 'completed', progress: 100 } : f)
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) => f.id === uploadFile.id ? {
            ...f,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f)
        );
      }
    }

    setIsUploading(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('audio/')) return '🎵';
    return '📄';
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  if (!isAuthed) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-text-muted mb-4">Please log in to upload assets.</p>
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Assets</h1>
          <p className="text-text-muted mt-1">Add media files to your library</p>
        </div>

        {/* Destination Folder */}
        <div className="bg-background-medium rounded-xl border border-background-light p-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-text-muted" />
            <span className="text-sm text-text-secondary">Upload to:</span>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="flex-1 h-10 px-3 bg-background-light border border-background-hover rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value="root">Root Folder</option>
              <option value="marketing">Marketing</option>
              <option value="production">Production</option>
              <option value="archive">Archive</option>
            </select>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-background-light hover:border-background-hover bg-background-medium'
          }`}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="video/*,image/*,audio/*,.pdf,.doc,.docx"
          />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-6 rounded-full ${isDragging ? 'bg-primary/20' : 'bg-background-light'}`}>
              <Cloud className={`w-12 h-12 ${isDragging ? 'text-primary' : 'text-text-muted'}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                {isDragging ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className="text-sm text-text-muted mt-2">
                or <span className="text-primary cursor-pointer hover:underline">browse</span> to select files
              </p>
            </div>
            <p className="text-xs text-text-muted">
              Supported: MP4, MOV, AVI, JPG, PNG, WebP, MP3, WAV, PDF (Max 5GB per file)
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-background-medium rounded-xl border border-background-light overflow-hidden">
            <div className="p-4 border-b border-background-light flex items-center justify-between">
              <h3 className="font-medium text-white">{files.length} file(s) selected</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiles([])}
                  className="px-3 py-1.5 text-sm text-text-muted hover:text-white"
                >
                  Clear All
                </button>
                <button
                  onClick={uploadFiles}
                  disabled={pendingCount === 0 || isUploading}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pendingCount > 0 && !isUploading
                      ? 'bg-primary hover:bg-primary-hover text-white'
                      : 'bg-background-light text-text-muted cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload ({pendingCount})
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {files.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center gap-4 p-4 border-b border-background-light last:border-0"
                >
                  <span className="text-3xl">{getFileIcon(uploadFile.file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-text-muted">{formatFileSize(uploadFile.file.size)}</p>
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2 h-1.5 bg-background-light rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    )}
                    {uploadFile.error && (
                      <p className="text-xs text-status-failed mt-1">{uploadFile.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {uploadFile.status === 'pending' && (
                      <span className="text-xs text-text-muted">Pending</span>
                    )}
                    {uploadFile.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                    {uploadFile.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-status-ready" />
                    )}
                    {uploadFile.status === 'failed' && (
                      <XCircle className="w-5 h-5 text-status-failed" />
                    )}
                    {(uploadFile.status === 'pending' || uploadFile.status === 'failed') && (
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="p-1 text-text-muted hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Summary */}
        {completedCount > 0 && (
          <div className="bg-status-ready/10 border border-status-ready/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-status-ready" />
              <span className="text-white font-medium">{completedCount} file(s) uploaded successfully</span>
            </div>
            <button
              onClick={() => router.push('/library')}
              className="px-4 py-2 bg-status-ready/20 hover:bg-status-ready/30 text-status-ready rounded-lg text-sm font-medium"
            >
              View in Library
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
