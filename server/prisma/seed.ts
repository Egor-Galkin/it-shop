// server/prisma/seed.ts

// 1. Загружаем переменные окружения
import "dotenv/config";

// 2. Импортируем PrismaClient
import { PrismaClient } from '@prisma/client';

// 3. Создаём клиент — используем @ts-ignore для обхода строгой типизации Prisma 7
// @ts-ignore
const prisma = new PrismaClient({
  // @ts-ignore
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Starting minimal database seed...');

  // === 1. Бренды ===
  await prisma.brand.createMany({
    data: [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Samsung' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created 2 brands');

  // === 2. Типы ===
  await prisma.type.createMany({
    data: [
      { id: 1, name: 'Смартфоны' },
      { id: 2, name: 'Ноутбуки' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created 2 types');

  // === 3. Устройства ===
  await prisma.device.createMany({
    data: [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        price: 119990.00,
        rating: 5.00,
        img: '/uploads/devices/iphone15pro.jpg',
        brandId: 1,
        typeId: 1,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created 1 device');

  console.log('🎉 Minimal seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });