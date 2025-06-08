import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import expenseRoutes from './routes/expense.routes';
import statsRoutes from './routes/stats.routes';
import budgetRoutes from './routes/budget.routes';
import ocrRoutes from './routes/ocr.routes';
import { generalLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;


// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // 이미지 업로드를 위해 필요
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind CSS 인라인 스타일 허용
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"], // 업로드된 이미지 허용
      connectSrc: ["'self'"],
    },
  },
}));

// CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002', 'http://172.30.1.7:3002', 'http://172.30.1.7:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (일반 요청용)
app.use('/api', generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ocr', ocrRoutes);

// Serve uploaded files
app.use('/uploads', express.static('src/uploads'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ExpenseTracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '실제 Prisma 백엔드가 정상 작동 중입니다!' });
});


// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ExpenseTracker API가 http://localhost:${PORT}에서 실행 중입니다!`);
  console.log(`📱 모바일 접속: http://172.30.1.7:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});