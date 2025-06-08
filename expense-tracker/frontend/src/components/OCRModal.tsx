import React, { useState, useRef } from 'react';
import { ocrService, OCRResult } from '../services/ocr.service';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOCRResult: (result: OCRResult) => void;
}

const OCRModal: React.FC<OCRModalProps> = ({ isOpen, onClose, onOCRResult }) => {
  const [processing, setProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, hideToast, showError } = useToast();

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      showError('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processImage = async () => {
    if (!selectedFile) {
      showError('이미지를 선택해주세요.');
      return;
    }

    setProcessing(true);
    try {
      const result = await ocrService.processReceipt(selectedFile);
      onOCRResult(result);
      onClose();
      resetModal();
    } catch (error) {
      console.error('OCR processing error:', error);
      showError('영수증 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreview(null);
    setProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!processing) {
      resetModal();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">영수증 OCR 인식</h2>
          <button
            onClick={handleClose}
            disabled={processing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm">
                <span className="font-medium text-indigo-600">클릭하여 파일 선택</span> 또는 드래그 앤 드롭
              </p>
              <p className="text-xs mt-1">PNG, JPG, GIF 파일 지원 (최대 10MB)</p>
              <p className="text-xs mt-1 text-gray-400">
                💡 팁: 글자가 선명하고 조명이 좋은 영수증 사진일수록 인식률이 높습니다
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {preview && (
              <div className="text-center">
                <img 
                  src={preview} 
                  alt="Receipt preview" 
                  className="max-w-full max-h-64 mx-auto rounded-lg border"
                />
                <p className="text-sm text-gray-500 mt-2">선택된 파일: {selectedFile.name}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-0">
              <button
                onClick={() => {
                  resetModal();
                }}
                disabled={processing}
                className="w-full px-6 py-4 sm:py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 font-semibold transition-all duration-200 min-h-[48px]"
              >
                다시 선택
              </button>
              <button
                onClick={processImage}
                disabled={processing}
                className="w-full px-6 py-4 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl disabled:opacity-50 flex items-center justify-center font-semibold transition-all duration-200 min-h-[48px]"
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="sm" variant="white" />
                    <span className="ml-2">처리중...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    OCR 처리
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {processing && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              영수증을 분석하고 있습니다. 잠시만 기다려주세요...
            </p>
          </div>
        )}
      </div>

      {/* Toast 알림 */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default OCRModal;