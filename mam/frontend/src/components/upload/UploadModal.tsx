'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Upload, File, CheckCircle, XCircle, Loader2, Cloud, FolderOpen } from 'lucide-react';
import { uploadAsset } from '@/lib/api';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (files: File[]) => void;
}

export default function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('root');

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleUpload = async () => {
    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      try {
        // Actually upload the file using the API
        await uploadAsset(uploadFile.file, {
          title: uploadFile.file.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
          onProgress: (progress) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress } : f
              )
            );
          },
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: 'completed', progress: 100 } : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'failed', error: error instanceof Error ? error.message : 'Upload failed' }
              : f
          )
        );
      }
    }

    onUploadComplete?.(files.map((f) => f.file));
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
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-background-medium rounded-xl shadow-2xl border border-background-light">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-background-light">
          <div>
            <h2 className="text-lg font-semibold text-white">Upload Assets</h2>
            <p className="text-sm text-text-muted">Add files to your media library</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white hover:bg-background-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Folder */}
        <div className="p-4 border-b border-background-light">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-text-muted" />
            <span className="text-sm text-text-secondary">Upload to:</span>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="flex-1 h-9 px-3 bg-background-light border border-background-hover rounded-lg text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="root">Root Folder</option>
              <option value="videos">Videos</option>
              <option value="images">Images</option>
              <option value="audio">Audio</option>
              <option value="documents">Documents</option>
            </select>
          </div>
        </div>

        {/* Drop Zone */}
        <div className="p-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-background-light hover:border-background-hover'
            }`}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="video/*,image/*,audio/*,.pdf,.doc,.docx"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/20' : 'bg-background-light'}`}>
                <Cloud className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-text-muted'}`} />
              </div>
              <div>
                <p className="text-white font-medium">
                  {isDragging ? 'Drop files here' : 'Drag and drop files here'}
                </p>
                <p className="text-sm text-text-muted mt-1">
                  or <span className="text-primary cursor-pointer hover:underline">browse</span> to select files
                </p>
              </div>
              <p className="text-xs text-text-muted">
                Supported: Videos, Images, Audio, Documents (Max 5GB per file)
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-background-light rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {files.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center gap-3 p-3 border-b border-background-hover last:border-0"
                  >
                    <span className="text-2xl">{getFileIcon(uploadFile.file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{uploadFile.file.name}</p>
                      <p className="text-xs text-text-muted">{formatFileSize(uploadFile.file.size)}</p>
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-1 h-1 bg-background-hover rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'pending' && (
                        <span className="text-xs text-text-muted">Pending</span>
                      )}
                      {uploadFile.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      )}
                      {uploadFile.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-status-ready" />
                      )}
                      {uploadFile.status === 'failed' && (
                        <XCircle className="w-4 h-4 text-status-failed" />
                      )}
                      {(uploadFile.status === 'pending' || uploadFile.status === 'failed') && (
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="p-1 text-text-muted hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-background-light bg-background-dark/50">
          <div className="text-sm text-text-muted">
            {files.length > 0 && (
              <span>
                {completedCount}/{files.length} uploaded
                {uploadingCount > 0 && ` • ${uploadingCount} uploading`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={pendingCount === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pendingCount > 0
                  ? 'bg-primary hover:bg-primary-hover text-white'
                  : 'bg-background-light text-text-muted cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload {pendingCount > 0 && `(${pendingCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
