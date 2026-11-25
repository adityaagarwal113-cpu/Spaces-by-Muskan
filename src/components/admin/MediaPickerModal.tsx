import React, { useRef, useState } from 'react';
import { Check, Image as ImageIcon, Search, Trash2, Upload, X } from 'lucide-react';
import { MediaItem } from '../../types';
import { ResolvedImg } from '../OptimizedImage';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  selectedUrl?: string;
  onSelect: (url: string) => void;
  onUploadFile: (file: File) => Promise<MediaItem | null>;
  onDeleteMedia?: (item: MediaItem) => Promise<void>;
  onClearSelection?: () => void;
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  media,
  selectedUrl,
  onSelect,
  onUploadFile,
  onDeleteMedia,
  onClearSelection,
  title = 'Select or Upload Media',
}) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'uploads' | 'muskan'>('all');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filtered = media.filter((item) => {
    if (tab !== 'all' && item.source !== tab) return false;
    if (search.trim()) {
      return item.filename.toLowerCase().includes(search.trim().toLowerCase());
    }
    return true;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setUploading(true);
    try {
      const uploaded = await onUploadFile(file);
      if (uploaded) {
        onSelect(uploaded.url);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteConfirm = async (item: MediaItem) => {
    if (!onDeleteMedia) return;
    setErrorMsg('');
    setDeletingKey(item.url);
    try {
      await onDeleteMedia(item);
      setConfirmDeleteKey(null);
      if (selectedUrl === item.url && onClearSelection) {
        onClearSelection();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not delete image.');
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans">
      <div className="w-full max-w-4xl bg-white border border-[#C3C4C7] shadow-2xl flex flex-col max-h-[86vh]">
        {/* WP Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#DCDCDE] flex items-center justify-between bg-[#F6F7F7]">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-4 h-4 text-[#2271B1]" />
            <h3 className="text-[15px] font-semibold text-[#1D2327]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#646970] hover:text-[#1D2327] cursor-pointer"
            aria-label="Close Media Library"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-[#DCDCDE] flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1 bg-[#F0F0F1] p-1 border border-[#DCDCDE]">
            {[
              { id: 'all', label: `All Media (${media.length})` },
              { id: 'uploads', label: 'Uploaded Files' },
              { id: 'muskan', label: 'Studio 4K Archive' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as 'all' | 'uploads' | 'muskan')}
                className={`px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  tab === item.id
                    ? 'bg-[#2271B1] text-white'
                    : 'text-[#50575E] hover:text-[#1D2327]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#646970] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search filenames..."
                className="pl-8 pr-3 py-1.5 text-xs border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none w-48 text-[#1D2327]"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-medium cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Optimizing WebP...' : 'Upload Image'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-3 px-3 py-2 bg-[#FCF0F1] border-l-4 border-[#D63638] text-xs text-[#8A2424]">
            {errorMsg}
          </div>
        )}

        {/* Media Grid */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#F0F0F1]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#646970]">
              No matching images found. Upload a new JPG, PNG, or WebP asset above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((item) => {
                const isSelected = selectedUrl === item.url;
                const isConfirming = confirmDeleteKey === item.url;
                const isDeleting = deletingKey === item.url;
                return (
                  <div
                    key={item.url}
                    className={`group relative bg-white border transition-all overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2271B1] ring-2 ring-[#2271B1]'
                        : 'border-[#C3C4C7] hover:border-[#2271B1]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      className="text-left cursor-pointer w-full"
                    >
                      <div className="aspect-square bg-[#E5E5E5] overflow-hidden relative">
                        <ResolvedImg
                          src={item.webpUrl || item.url}
                          preferThumb
                          alt={item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#2271B1] text-white flex items-center justify-center shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5 border-t border-[#F0F0F1]">
                        <p className="text-[11px] text-[#1D2327] font-medium truncate">
                          {item.filename}
                        </p>
                        <p className="text-[10px] text-[#646970] font-mono tabular-nums">
                          {item.optimized ? 'WebP' : 'Raw'} · {(item.sizeBytes / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </button>

                    {onDeleteMedia && (
                      <div className="px-2 py-1 border-t border-[#F0F0F1] bg-[#FAFAFA] flex items-center justify-between text-[10px]">
                        {isConfirming ? (
                          <div className="flex items-center justify-between w-full gap-1">
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => void handleDeleteConfirm(item)}
                              className="text-[#D63638] font-semibold cursor-pointer"
                            >
                              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteKey(null)}
                              className="text-[#646970] hover:text-[#1D2327] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKey(item.url)}
                            className="inline-flex items-center gap-1 text-[#B32D2E] hover:underline cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete file</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {onClearSelection && selectedUrl && (
          <div className="px-5 py-2.5 border-t border-[#DCDCDE] bg-[#F6F7F7] flex items-center justify-between text-xs">
            <span className="text-[#646970] truncate max-w-md">Current: {selectedUrl}</span>
            <button
              type="button"
              onClick={() => {
                onClearSelection();
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1 border border-[#D63638] text-[#B32D2E] hover:bg-[#FCF0F1] font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Image from Slot</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
