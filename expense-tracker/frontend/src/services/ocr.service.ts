import api from './api';

export interface OCRResult {
  success: boolean;
  extractedText: string;
  parsedData: {
    merchantName: string;
    totalAmount: number;
    date: string;
    items: string[];
    suggestedCategory: string;
    rawText: string;
    receiptImageUrl?: string;
  };
}

export interface UploadResult {
  success: boolean;
  imageUrl: string;
  filename: string;
}

export const ocrService = {
  // Process receipt with OCR
  processReceipt: async (imageFile: File): Promise<OCRResult> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/ocr/receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Upload receipt image without OCR processing
  uploadImage: async (imageFile: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/ocr/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};