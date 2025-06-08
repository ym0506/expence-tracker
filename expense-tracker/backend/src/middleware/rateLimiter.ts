import rateLimit from 'express-rate-limit';

// 일반 API 요청용 rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 15분 동안 최대 100개 요청
  message: {
    error: 'Too many requests',
    message: '너무 많은 요청이 발생했습니다. 15분 후에 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증 관련 요청용 rate limiter (더 엄격)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분 동안 최대 5개 요청
  message: {
    error: 'Too many login attempts',
    message: '로그인 시도가 너무 많습니다. 15분 후에 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 성공한 요청은 카운트에서 제외
  skipSuccessfulRequests: true,
});

// OCR 처리용 rate limiter (리소스 집약적)
export const ocrLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 3, // 1분 동안 최대 3개 요청
  message: {
    error: 'Too many OCR requests',
    message: 'OCR 요청이 너무 많습니다. 1분 후에 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 파일 업로드용 rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 1분 동안 최대 10개 요청
  message: {
    error: 'Too many upload requests',
    message: '파일 업로드 요청이 너무 많습니다. 1분 후에 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});