// server/prisma/seed.ts

// 1. Импортируем конфиг Prisma ПЕРЕД PrismaClient — это критически важно!
import '../prisma.config';

// 2. Импортируем PrismaClient
import { PrismaClient } from '@prisma/client';

// 3. Создаём клиент — конфиг уже загружен, DATABASE_URL будет подхвачен
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal database seed...');

  // === 1. Бренды (нет зависимостей) ===
  await prisma.brand.createMany({
    data: [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Samsung' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created 2 brands');

  // === 2. Типы устройств (нет зависимостей) ===
  await prisma.type.createMany({
    data: [
      { id: 1, name: 'Смартфоны' },
      { id: 2, name: 'Ноутбуки' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created 2 types');

  // === 3. Пользователи (нет зависимостей) ===
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        email: 'admin@test.com',
        password: '$2b$10$xokm9YONzY3zC4EIcyx/0ef5cwz5va5RPQymakb8aWx46qizQeyLe',
        role: 'ADMIN',
      },
      {
        id: 2,
        email: 'user@test.com',
        password: '$2b$10$Vk7VrvEcvqxg2ZayAHfjtuEdcNARyMCiKoJPTaK99.dSZe9RtkKZC',
        role: 'CLIENT',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created 2 users');

  // === 4. Варианты доставки (нет зависимостей) ===
  await prisma.deliveryOption.createMany({
    data: [
      {
        id: 1,
        name: 'Доставка',
        type: 'DELIVERY',
        price: 100.00,
        description: '2-3 дня',
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 2,
        name: 'Самовывоз',
        type: 'PICKUP',
        address: 'г. Москва, тестовая ул., 1',
        description: 'Пн-Вс 10:00-20:00',
        isActive: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created 2 delivery options');

  // === 5. Устройства (зависят от brands и types) ===
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
      {
        id: 2,
        name: 'MacBook Pro 16"',
        price: 249990.00,
        rating: 4.50,
        img: '/uploads/devices/mbp16.jpg',
        brandId: 1,
        typeId: 2,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created 2 devices');

  // === 6. Device Info (зависит от devices) ===
  await prisma.deviceInfo.createMany({
    data: [
      {
        deviceId: 1,
        title: 'Процессор',
        description: 'Apple A17 Pro, 6-ядерный',
      },
      {
        deviceId: 1,
        title: 'Память',
        description: '256 ГБ',
      },
      {
        deviceId: 2,
        title: 'Процессор',
        description: 'Apple M3 Pro',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created device info');

  // === 7. Device Images (зависит от devices) ===
  await prisma.deviceImage.createMany({
    data: [
      { deviceId: 1, img: '/uploads/devices/iphone15pro.jpg' },
      { deviceId: 2, img: '/uploads/devices/mbp16.jpg' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created device images');

  // === 8. Скидки (зависят от devices) ===
  await prisma.discount.createMany({
    data: [
      {
        id: 1,
        deviceId: 1,
        value: 10.00,
        dateStart: new Date('2026-01-01'),
        dateEnd: new Date('2026-12-31'),
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created discounts');

  // === 9. Отзывы (зависят от users и devices) ===
  await prisma.rating.createMany({
    data: [
      {
        id: 1,
        userId: 2,
        deviceId: 1,
        rate: 5,
        hidden: false,
        description: 'Отличный телефон!',
      },
      {
        id: 2,
        userId: 2,
        deviceId: 2,
        rate: 4,
        hidden: false,
        description: 'Мощный ноутбук.',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created ratings');

  // === 10. Корзины (зависят от users и deliveryOptions) ===
  await prisma.basket.createMany({
    data: [
      {
        id: 1,
        userId: 2,
        paidAt: null,
        deliveredAt: null,
        deliveryOptionId: 1,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created baskets');

  // === 11. Товары в корзинах (зависят от baskets и devices) ===
  await prisma.basketDevice.createMany({
    data: [
      { basketId: 1, deviceId: 1, quantity: 1 },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created basket devices');

  console.log('🎉 Minimal seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });