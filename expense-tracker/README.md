# ExpenseTracker - AI 기반 개인 가계부 앱

## 🚀 빠른 시작

### 자동 설정 (권장)
```bash
./setup.sh
```

### 수동 설정
1. **데이터베이스 실행**
```bash
docker-compose up -d
```

2. **백엔드 설정**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

3. **프론트엔드 설정** (새 터미널에서)
```bash
cd frontend
npm install
npm start
```

## 📋 주요 기능

### ✅ 구현 완료
- 🔐 **JWT 기반 인증** (회원가입/로그인, 사용자 정보 조회)
- 📊 **대시보드** (월별 통계, 카테고리별 차트, 실시간 데이터)
- 💰 **지출 관리** (추가/수정/삭제/조회, 페이지네이션, 필터링)
- 🏷️ **카테고리별 분류** (사용자 정의 카테고리, 아이콘 지원)
- 📸 **OCR 영수증 인식** (Tesseract.js 기반, 한국어+영어 지원)
  - 자동 금액/날짜/상점명 추출
  - 스마트 카테고리 자동 분류
  - 드래그 앤 드롭 이미지 업로드
- 📅 **예산 관리** (카테고리별 예산 설정, 실시간 예산 대비 지출 모니터링)
  - 예산 초과 알림 시스템
  - 월별 예산 현황 대시보드
  - 진행률 시각화
- 📊 **고급 분석 및 인사이트**
  - 월별 지출 트렌드 분석
  - 카테고리별 지출 패턴 분석
  - 주간 지출 패턴 시각화
  - 전월 대비 증감률 분석
- 🔔 **스마트 알림** (예산 초과 경고, 지출 패턴 인사이트)
- 📱 **반응형 디자인** (모바일/태블릿/데스크톱 지원)

### 🚧 향후 계획
- 📱 네이티브 모바일 앱 (React Native)
- 📈 더 고급 통계 및 예측 분석
- 🔄 자동 카테고리 학습 (AI 기반)
- 🌍 다국어 지원
- 💳 은행 API 연동

## 🛠 기술 스택

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **OCR**: Tesseract.js (한국어+영어 지원)
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Charts**: Chart.js
- **HTTP Client**: Axios

## 📁 프로젝트 구조
```
expense-tracker/
├── backend/                 # 백엔드 서버
│   ├── src/
│   │   ├── controllers/     # API 컨트롤러
│   │   ├── routes/         # 라우트 정의
│   │   ├── middleware/     # 미들웨어
│   │   ├── services/       # 비즈니스 로직
│   │   └── config/         # 설정 파일
│   ├── prisma/             # 데이터베이스 스키마
│   └── .env                # 환경 변수
├── frontend/               # 프론트엔드 앱
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── store/          # Redux 스토어
│   │   ├── services/       # API 서비스
│   │   └── types/          # TypeScript 타입
│   └── .env                # 환경 변수
├── docker-compose.yml      # 데이터베이스 설정
└── setup.sh               # 자동 설정 스크립트
```

## 🔗 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 사용자 정보 조회

### 지출 관리
- `GET /api/expenses` - 지출 목록 조회 (필터링, 페이지네이션 지원)
- `POST /api/expenses` - 지출 추가
- `PUT /api/expenses/:id` - 지출 수정
- `DELETE /api/expenses/:id` - 지출 삭제

### 카테고리
- `GET /api/categories` - 카테고리 목록
- `POST /api/categories` - 카테고리 추가

### 예산 관리
- `GET /api/budgets` - 예산 목록 조회
- `POST /api/budgets` - 예산 설정
- `PUT /api/budgets/:id` - 예산 수정
- `DELETE /api/budgets/:id` - 예산 삭제
- `GET /api/budgets/comparison` - 예산 대비 실제 지출 비교

### OCR 영수증 인식
- `POST /api/ocr/receipt` - 영수증 이미지 OCR 처리
- `POST /api/ocr/upload` - 영수증 이미지 업로드만

### 통계 및 인사이트
- `GET /api/stats/monthly` - 월별 통계
- `GET /api/stats/category` - 카테고리별 통계
- `GET /api/stats/insights` - 지출 인사이트 분석
- `GET /api/stats/budget-vs-actual` - 예산 대비 실제 지출 분석

## 🌐 접속 정보
- **프론트엔드**: http://localhost:3002
- **백엔드**: http://localhost:5002
- **데이터베이스**: localhost:5432

## 📝 개발 팁

### 데이터베이스 초기화
```bash
cd backend
npx prisma db push --force-reset
npx prisma db seed
```

### 타입 생성
```bash
cd backend
npx prisma generate
```