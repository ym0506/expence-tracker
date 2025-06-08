import { Request, Response } from 'express';
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    // 파일명에 위험한 문자가 있는지 확인
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.originalname)) {
      return cb(new Error('안전하지 않은 파일명입니다.'));
    }
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일(JPEG, PNG, GIF)만 업로드 가능합니다.'));
    }
  }
});

// Parse receipt text to extract expense data
function parseReceiptText(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let totalAmount = 0;
  let merchantName = '';
  let date = '';
  let items: string[] = [];
  
  // Extract merchant name (usually first few lines)
  if (lines.length > 0) {
    merchantName = lines[0];
  }
  
  // Look for total amount patterns
  const amountPatterns = [
    /총\s*금액\s*[:\s]*(\d{1,3}(?:,\d{3})*)/,
    /합계\s*[:\s]*(\d{1,3}(?:,\d{3})*)/,
    /total\s*[:\s]*(\d{1,3}(?:,\d{3})*)/i,
    /(\d{1,3}(?:,\d{3})*)\s*원?$/
  ];
  
  for (const line of lines) {
    for (const pattern of amountPatterns) {
      const match = line.match(pattern);
      if (match) {
        const amount = parseInt(match[1].replace(/,/g, ''));
        if (amount > totalAmount) {
          totalAmount = amount;
        }
      }
    }
  }
  
  // Look for date patterns
  const datePatterns = [
    /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/,
    /(\d{2})[.-](\d{1,2})[.-](\d{1,2})/,
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/
  ];
  
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        let year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        
        // Handle 2-digit years
        if (year.length === 2) {
          const currentYear = new Date().getFullYear();
          const currentCentury = Math.floor(currentYear / 100) * 100;
          year = String(currentCentury + parseInt(year));
        }
        
        date = `${year}-${month}-${day}`;
        break;
      }
    }
    if (date) break;
  }
  
  // Extract items (basic implementation)
  for (const line of lines) {
    // Skip lines that are obviously not items
    if (line.match(/총|합계|금액|카드|현금|date|time|tel|주소|사업자/i)) {
      continue;
    }
    
    // Look for lines that might be items (contain price)
    if (line.match(/\d{1,3}(?:,\d{3})*/) && line.length > 3) {
      items.push(line);
    }
  }
  
  // Determine category based on merchant name or items
  const categoryMapping = {
    '식비': ['음식', '식당', '카페', '커피', '치킨', '피자', '햄버거', '맥도날드', 'KFC', '버거킹', '스타벅스', '이디야'],
    '교통비': ['주유소', 'GS칼텍스', 'SK에너지', 'S-OIL', '버스', '지하철', '택시'],
    '쇼핑': ['마트', '이마트', '롯데마트', '홈플러스', '코스트코', '쇼핑몰', '백화점'],
    '의료/건강': ['병원', '약국', '의원', '한의원', '치과'],
    '문화/여가': ['영화관', 'CGV', '롯데시네마', '메가박스', '노래방', 'PC방'],
    '통신비': ['통신', 'SKT', 'KT', 'LG U+'],
    '주거비': ['아파트', '빌라', '원룸', '전기', '가스', '수도'],
    '교육': ['학원', '서점', '교보문고', '영풍문고']
  };
  
  let suggestedCategory = '기타';
  const fullText = (merchantName + ' ' + items.join(' ')).toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryMapping)) {
    if (keywords.some(keyword => fullText.includes(keyword.toLowerCase()))) {
      suggestedCategory = category;
      break;
    }
  }
  
  return {
    merchantName: merchantName || '알 수 없음',
    totalAmount,
    date: date || new Date().toISOString().split('T')[0],
    items,
    suggestedCategory,
    rawText: text,
    receiptImageUrl: '' // OCR 처리 시 설정됨
  };
}

export const processReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    const imagePath = req.file.path;
    
    // Process with Tesseract
    const worker = await createWorker('kor+eng');
    
    try {
      const { data: { text } } = await worker.recognize(imagePath);
      
      // Parse the extracted text
      const parsedData = parseReceiptText(text);
      
      // 이미지를 영구 저장 경로로 이동 (삭제하지 않음)
      const permanentPath = `/uploads/${req.file.filename}`;
      parsedData.receiptImageUrl = permanentPath;
      
      res.json({
        success: true,
        extractedText: text,
        parsedData
      });
      
    } catch (ocrError) {
      console.error('OCR processing error:', ocrError);
      
      // 에러 발생 시에만 파일 삭제
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      res.status(500).json({ 
        message: 'OCR 처리 중 오류가 발생했습니다.',
        error: ocrError instanceof Error ? ocrError.message : 'Unknown error'
      });
    } finally {
      await worker.terminate();
    }
    
  } catch (error) {
    console.error('Receipt processing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadReceiptImage = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    // Return the file path for storage with expense record
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};