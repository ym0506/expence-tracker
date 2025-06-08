import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { processReceipt, uploadReceiptImage, upload } from '../controllers/ocr.controller';
import { ocrLimiter, uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// All OCR routes require authentication
router.use(authenticateToken);

// POST /api/ocr/receipt - Process receipt image with OCR
router.post('/receipt', ocrLimiter, upload.single('image'), processReceipt);

// POST /api/ocr/upload - Upload receipt image only (without OCR processing)
router.post('/upload', uploadLimiter, upload.single('image'), uploadReceiptImage);

export default router;