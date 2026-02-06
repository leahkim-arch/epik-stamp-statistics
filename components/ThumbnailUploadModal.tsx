'use client';

import { useState, useRef, DragEvent } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ThumbnailUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  stampName: string;
  currentThumbnail?: string;
  onUploadSuccess: (stampName: string, imageUrl: string) => void;
}

export default function ThumbnailUploadModal({
  isOpen,
  onClose,
  stampName,
  currentThumbnail,
  onUploadSuccess,
}: ThumbnailUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) {
      alert('이미지를 선택해주세요.');
      return;
    }

    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      alert('파일을 선택해주세요.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('stampName', stampName);

      const response = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      onUploadSuccess(stampName, data.thumbnailUrl);
      handleClose();
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">썸네일 업로드</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stamp Name */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">스탬프 이름</p>
          <p className="text-white font-medium">{stampName}</p>
        </div>

        {/* Current Thumbnail Preview */}
        {currentThumbnail && !preview && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">현재 썸네일</p>
            <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
              <img
                src={currentThumbnail}
                alt="Current thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/280x280.png?text=No+Image';
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
            }
          `}
        >
          {preview ? (
            <div className="space-y-4">
              <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                >
                  다른 이미지 선택
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      업로드
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-gray-700/50 rounded-full">
                  <ImageIcon size={32} className="text-gray-400" />
                </div>
              </div>
              <div>
                <p className="text-white mb-1">이미지를 드래그하거나 클릭하여 선택</p>
                <p className="text-gray-400 text-sm">PNG, JPG, GIF (최대 5MB)</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                파일 선택
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
