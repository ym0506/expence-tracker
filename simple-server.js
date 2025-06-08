const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  // OPTIONS 요청 처리 (CORS preflight)
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // POST 요청 body 파싱
  if (method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        if (pathname === '/api/auth/register') {
          const { name, email, password } = data;
          console.log('Register request:', { name, email, password });
          
          if (!name || !email || !password) {
            res.writeHead(400);
            res.end(JSON.stringify({ message: 'All fields are required' }));
            return;
          }
          
          res.writeHead(201);
          res.end(JSON.stringify({
            message: 'User created successfully',
            token: 'temp-jwt-token-' + Date.now(),
            user: { id: '1', email: email, name: name }
          }));
          return;
        }
        
        if (pathname === '/api/auth/login') {
          const { email, password } = data;
          console.log('Login request:', { email, password });
          
          if (!email || !password) {
            res.writeHead(400);
            res.end(JSON.stringify({ message: 'Email and password are required' }));
            return;
          }
          
          res.writeHead(200);
          res.end(JSON.stringify({
            message: 'Login successful',
            token: 'temp-jwt-token-' + Date.now(),
            user: { id: '1', email: email, name: 'Test User' }
          }));
          return;
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
        return;
      }
    });
    return;
  }

  // GET 요청 처리
  if (method === 'GET') {
    if (pathname === '/api/test') {
      res.writeHead(200);
      res.end(JSON.stringify({ message: '백엔드 서버가 정상 작동 중입니다!' }));
      return;
    }
    
    // /api/auth/me 처리
    if (pathname === '/api/auth/me') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401);
        res.end(JSON.stringify({ message: 'No token provided' }));
        return;
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date().toISOString()
        }
      }));
      return;
    }
    
    if (pathname === '/api/categories') {
      const categories = [
        { id: '1', name: '식비', color: '#FF6B6B', icon: '🍽️' },
        { id: '2', name: '교통비', color: '#4ECDC4', icon: '🚗' },
        { id: '3', name: '쇼핑', color: '#45B7D1', icon: '🛍️' },
        { id: '4', name: '문화/여가', color: '#96CEB4', icon: '🎬' },
        { id: '5', name: '의료/건강', color: '#DDA0DD', icon: '🏥' },
        { id: '6', name: '교육', color: '#98D8C8', icon: '📚' },
        { id: '7', name: '통신비', color: '#F7DC6F', icon: '📱' },
        { id: '8', name: '주거비', color: '#BB8FCE', icon: '🏠' },
        { id: '9', name: '보험/금융', color: '#85C1E2', icon: '💰' },
        { id: '10', name: '기타', color: '#F8C471', icon: '📌' }
      ];
      res.writeHead(200);
      res.end(JSON.stringify(categories));
      return;
    }
    
    // Monthly stats API
    if (pathname === '/api/stats/monthly') {
      const monthlyStats = {
        month: parsedUrl.query.year + '-' + parsedUrl.query.month,
        totalAmount: '150000',
        categoryBreakdown: [
          {
            category: { id: '1', name: '식비', color: '#FF6B6B', icon: '🍽️' },
            totalAmount: '80000',
            transactionCount: 15
          },
          {
            category: { id: '2', name: '교통비', color: '#4ECDC4', icon: '🚗' },
            totalAmount: '45000',
            transactionCount: 8
          },
          {
            category: { id: '3', name: '쇼핑', color: '#45B7D1', icon: '🛍️' },
            totalAmount: '25000',
            transactionCount: 3
          }
        ]
      };
      res.writeHead(200);
      res.end(JSON.stringify(monthlyStats));
      return;
    }
    
    // Budget comparison API
    if (pathname === '/api/budgets/comparison') {
      const budgetComparison = {
        month: parsedUrl.query.month,
        totalBudget: '200000',
        totalActual: '150000',
        totalRemaining: '50000',
        totalUsagePercentage: 75,
        categories: [
          {
            categoryId: '1',
            categoryName: '식비',
            budgetAmount: 100000,
            actualAmount: 80000,
            remainingAmount: 20000,
            usagePercentage: 80,
            isOverBudget: false
          },
          {
            categoryId: '2',
            categoryName: '교통비',
            budgetAmount: 60000,
            actualAmount: 45000,
            remainingAmount: 15000,
            usagePercentage: 75,
            isOverBudget: false
          }
        ]
      };
      res.writeHead(200);
      res.end(JSON.stringify(budgetComparison));
      return;
    }
    
    // Expenses API
    if (pathname === '/api/expenses') {
      const expenses = {
        expenses: [
          {
            id: '1',
            amount: '15000',
            description: '점심 식사',
            date: '2025-06-04',
            category: { id: '1', name: '식비', icon: '🍽️' }
          },
          {
            id: '2',
            amount: '3000',
            description: '지하철',
            date: '2025-06-04',
            category: { id: '2', name: '교통비', icon: '🚗' }
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      };
      res.writeHead(200);
      res.end(JSON.stringify(expenses));
      return;
    }
    
    // Insights API
    if (pathname === '/api/stats/insights') {
      const insights = {
        currentMonth: {
          total: 150000,
          transactionCount: 26
        },
        lastMonth: {
          total: 120000,
          transactionCount: 20
        },
        monthlyChange: {
          amount: 30000,
          percentage: 25.0,
          trend: 'increase'
        },
        topSpendingCategory: {
          category: { id: '1', name: '식비', icon: '🍽️', color: '#FF6B6B' },
          amount: 80000
        },
        weeklyTrend: [
          { date: '2025-05-29', amount: 12000 },
          { date: '2025-05-30', amount: 8000 },
          { date: '2025-05-31', amount: 15000 },
          { date: '2025-06-01', amount: 20000 },
          { date: '2025-06-02', amount: 10000 },
          { date: '2025-06-03', amount: 18000 },
          { date: '2025-06-04', amount: 22000 }
        ]
      };
      res.writeHead(200);
      res.end(JSON.stringify(insights));
      return;
    }
  }

  // 404 처리
  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Not Found' }));
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🚀 ExpenseTracker API가 http://localhost:${PORT}에서 실행 중입니다!`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/test`);
});