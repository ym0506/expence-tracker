import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: '식비', color: '#FF6B6B', icon: '🍽️' },
  { name: '교통비', color: '#4ECDC4', icon: '🚗' },
  { name: '쇼핑', color: '#45B7D1', icon: '🛍️' },
  { name: '문화/여가', color: '#96CEB4', icon: '🎬' },
  { name: '의료/건강', color: '#DDA0DD', icon: '🏥' },
  { name: '교육', color: '#98D8C8', icon: '📚' },
  { name: '통신비', color: '#F7DC6F', icon: '📱' },
  { name: '주거비', color: '#BB8FCE', icon: '🏠' },
  { name: '보험/금융', color: '#85C1E2', icon: '💰' },
  { name: '기타', color: '#F8C471', icon: '📌' }
];

async function main() {
  console.log('Start seeding...');
  
  for (const category of categories) {
    await prisma.category.create({
      data: category
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });