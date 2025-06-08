#!/bin/bash

echo "🚀 ExpenseTracker 설정을 시작합니다..."

# 현재 디렉토리 확인
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml 파일을 찾을 수 없습니다. expense-tracker 디렉토리에서 실행해주세요."
    exit 1
fi

# 데이터베이스 실행
echo "📦 Docker로 PostgreSQL 데이터베이스를 시작합니다..."
docker-compose up -d

# 데이터베이스가 준비될 때까지 잠시 대기
echo "⏳ 데이터베이스가 시작될 때까지 잠시 기다립니다..."
sleep 10

# 백엔드 의존성 설치 및 마이그레이션
echo "🔧 백엔드 설정 중..."
cd backend

# 의존성이 설치되어 있지 않다면 설치
if [ ! -d "node_modules" ]; then
    echo "📦 백엔드 의존성 설치 중..."
    npm install
fi

# Prisma 설정
echo "🗄️ 데이터베이스 설정 중..."
npx prisma generate
npx prisma db push
npx prisma db seed

# 프론트엔드로 이동
echo "🎨 프론트엔드 설정 중..."
cd ../frontend

# 의존성이 설치되어 있지 않다면 설치
if [ ! -d "node_modules" ]; then
    echo "📦 프론트엔드 의존성 설치 중..."
    npm install
fi

cd ..

echo "✅ 설정 완료!"
echo ""
echo "🚀 서버 실행 방법:"
echo "1. 백엔드: cd backend && npm run dev"
echo "2. 프론트엔드: cd frontend && npm start"
echo ""
echo "🌐 브라우저에서 http://localhost:3000 으로 접속하세요!"