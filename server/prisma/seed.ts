// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Brands
  await prisma.brand.createMany({
    data: [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Samsung' },
      { id: 3, name: 'Xiaomi' },
      { id: 4, name: 'Sony' },
      { id: 5, name: 'Huawei' },
      { id: 6, name: 'Logitech' },
      { id: 7, name: 'ASUS' },
      { id: 8, name: 'Lenovo' },
    ],
    skipDuplicates: true,
  });
  console.log('Created brands');

  // 2. Types
  await prisma.type.createMany({
    data: [
      { id: 1, name: 'Смартфоны' },
      { id: 2, name: 'Ноутбуки' },
      { id: 3, name: 'Планшеты' },
      { id: 4, name: 'Наушники' },
      { id: 5, name: 'Умные часы' },
      { id: 6, name: 'Аксессуары' },
      { id: 7, name: 'Компьютеры' },
    ],
    skipDuplicates: true,
  });
  console.log('Created types');

  // 3. Devices
  await prisma.device.createMany({
    data: [
      { id: 1, name: 'iPhone 15 Pro', price: 119990.00, rating: 5.00, img: '/uploads/devices/iphone15pro.jpg', brandId: 1, typeId: 1 },
      { id: 2, name: 'iPhone 15', price: 89990.00, rating: 4.00, img: '/uploads/devices/iphone15.jpg', brandId: 1, typeId: 1 },
      { id: 3, name: 'iPhone 14 Pro', price: 99990.00, img: '/uploads/devices/iphone14pro.jpg', brandId: 1, typeId: 1 },
      { id: 4, name: 'iPhone SE (2024)', price: 49990.00, img: '/uploads/devices/iphonese.jpg', brandId: 1, typeId: 1 },
      { id: 5, name: 'Galaxy S24 Ultra', price: 109990.00, rating: 5.00, img: '/uploads/devices/s24ultra.jpg', brandId: 2, typeId: 1 },
      { id: 6, name: 'Galaxy S24', price: 79990.00, rating: 3.00, img: '/uploads/devices/s24.jpg', brandId: 2, typeId: 1 },
      { id: 7, name: 'Galaxy A55', price: 39990.00, img: '/uploads/devices/a55.jpg', brandId: 2, typeId: 1 },
      { id: 8, name: 'Galaxy Z Fold5', price: 149990.00, img: '/uploads/devices/zfold5.jpg', brandId: 2, typeId: 1 },
      { id: 9, name: 'Xiaomi 14 Pro', price: 79990.00, rating: 5.00, img: '/uploads/devices/xiaomi14pro.jpg', brandId: 3, typeId: 1 },
      { id: 10, name: 'Xiaomi 13T', price: 49990.00, img: '/uploads/devices/xiaomi13t.jpg', brandId: 3, typeId: 1 },
      { id: 11, name: 'Redmi Note 13 Pro', price: 29990.00, rating: 5.00, img: '/uploads/devices/redminote13.jpg', brandId: 3, typeId: 1 },
      { id: 12, name: 'POCO F5', price: 34990.00, img: '/uploads/devices/pocof5.jpg', brandId: 3, typeId: 1 },
      { id: 13, name: 'MacBook Pro 16" M3', price: 249990.00, rating: 4.00, img: '/uploads/devices/mbp16m3.jpg', brandId: 1, typeId: 2 },
      { id: 14, name: 'MacBook Air 13" M2', price: 119990.00, rating: 5.00, img: '/uploads/devices/mba13m2.jpg', brandId: 1, typeId: 2 },
      { id: 15, name: 'MacBook Pro 14" M3', price: 199990.00, img: '/uploads/devices/mbp14m3.jpg', brandId: 1, typeId: 2 },
      { id: 16, name: 'ASUS ROG Zephyrus G16', price: 189990.00, rating: 4.00, img: '/uploads/devices/zephyrusg16.jpg', brandId: 7, typeId: 2 },
      { id: 17, name: 'Lenovo Legion 5 Pro', price: 149990.00, img: '/uploads/devices/legion5pro.jpg', brandId: 8, typeId: 2 },
      { id: 18, name: 'ASUS Vivobook 15', price: 59990.00, img: '/uploads/devices/vivobook15.jpg', brandId: 7, typeId: 2 },
      { id: 19, name: 'Lenovo IdeaPad 3', price: 44990.00, img: '/uploads/devices/ideapad3.jpg', brandId: 8, typeId: 2 },
      { id: 20, name: 'iPad Pro 12.9" M2', price: 129990.00, rating: 4.00, img: '/uploads/devices/ipadpro129.jpg', brandId: 1, typeId: 3 },
      { id: 21, name: 'iPad Air 11"', price: 69990.00, img: '/uploads/devices/ipadair11.jpg', brandId: 1, typeId: 3 },
      { id: 22, name: 'Samsung Galaxy Tab S9', price: 79990.00, rating: 4.00, img: '/uploads/devices/tabs9.jpg', brandId: 2, typeId: 3 },
      { id: 23, name: 'Xiaomi Pad 6', price: 34990.00, img: '/uploads/devices/xiaomipad6.jpg', brandId: 3, typeId: 3 },
      { id: 24, name: 'AirPods Pro 2', price: 24990.00, rating: 4.00, img: '/uploads/devices/airpodspro2.jpg', brandId: 1, typeId: 4 },
      { id: 25, name: 'Sony WH-1000XM5', price: 34990.00, rating: 5.00, img: '/uploads/devices/sonywh1000xm5.jpg', brandId: 4, typeId: 4 },
      { id: 26, name: 'Samsung Galaxy Buds2 Pro', price: 19990.00, rating: 4.00, img: '/uploads/devices/buds2pro.jpg', brandId: 2, typeId: 4 },
      { id: 27, name: 'Xiaomi Buds 4 Pro', price: 14990.00, img: '/uploads/devices/buds4pro.jpg', brandId: 3, typeId: 4 },
      { id: 28, name: 'Apple Watch Series 9', price: 44990.00, rating: 3.00, img: '/uploads/devices/watchs9.jpg', brandId: 1, typeId: 5 },
      { id: 29, name: 'Samsung Galaxy Watch6', price: 34990.00, img: '/uploads/devices/watch6.jpg', brandId: 2, typeId: 5 },
      { id: 30, name: 'Xiaomi Watch S3', price: 19990.00, rating: 3.00, img: '/uploads/devices/watchs3.jpg', brandId: 3, typeId: 5 },
      { id: 31, name: 'iMac 24" M3', price: 159990.00, img: '/uploads/devices/imac24m3.jpg', brandId: 1, typeId: 7 },
      { id: 32, name: 'Mac Studio M2 Ultra', price: 349990.00, img: '/uploads/devices/macstudio.jpg', brandId: 1, typeId: 7 },
      { id: 33, name: 'ASUS ROG Desktop', price: 129990.00, img: '/uploads/devices/rogdesktop.jpg', brandId: 7, typeId: 7 },
      { id: 34, name: 'MagSafe Charger', price: 4990.00, img: '/uploads/devices/magsafe.jpg', brandId: 1, typeId: 6 },
      { id: 35, name: 'Samsung 45W Charger', price: 3990.00, img: '/uploads/devices/samsung45w.jpg', brandId: 2, typeId: 6 },
      { id: 36, name: 'Device', price: 101.00, img: '/uploads/devices/506c9f01-7630-4de5-8de7-b6b578e112a6.jpg', brandId: 7, typeId: 7 },
    ],
    skipDuplicates: true,
  });
  console.log('Created devices');

  // 4. Device Info
  await prisma.deviceInfo.createMany({
    data: [
      { deviceId: 2, title: 'Процессор', description: 'Apple A16 Bionic, 6-ядерный' },
      { deviceId: 2, title: 'Экран', description: '6.1" Super Retina XDR OLED, 60Hz' },
      { deviceId: 2, title: 'Камера', description: 'Основная 48 Мп + ультраширокая 12 Мп' },
      { deviceId: 2, title: 'Память', description: '128 ГБ / 256 ГБ / 512 ГБ' },
      { deviceId: 5, title: 'Процессор', description: 'Snapdragon 8 Gen 3 for Galaxy' },
      { deviceId: 5, title: 'Экран', description: '6.8" Dynamic AMOLED 2X, 120Hz, S Pen' },
      { deviceId: 5, title: 'Камера', description: '200 Мп основная + 50 Мп телеобъектив + 12 Мп ультраширокая' },
      { deviceId: 5, title: 'Память', description: '256 ГБ / 512 ГБ / 1 ТБ, 12 ГБ RAM' },
      { deviceId: 5, title: 'Аккумулятор', description: '5000 мАч, зарядка 45 Вт' },
      { deviceId: 13, title: 'Процессор', description: 'Apple M3 Pro / M3 Max, до 16 ядер' },
      { deviceId: 13, title: 'Экран', description: '16.2" Liquid Retina XDR, 120Hz ProMotion' },
      { deviceId: 13, title: 'Память', description: '18-128 ГБ унифицированной, 512 ГБ - 8 ТБ SSD' },
      { deviceId: 13, title: 'Порты', description: '3x Thunderbolt 4, HDMI, SDXC, MagSafe' },
      { deviceId: 13, title: 'Автономность', description: 'До 22 часов работы' },
      { deviceId: 3, title: 'Процессор', description: 'Apple A16 Bionic' },
      { deviceId: 3, title: 'Экран', description: '6.1" OLED, 120Hz' },
      { deviceId: 3, title: 'Камера', description: '48 Мп основная + 12 Мп' },
      { deviceId: 6, title: 'Процессор', description: 'Exynos 2400 / Snapdragon 8 Gen 3' },
      { deviceId: 6, title: 'Экран', description: '6.2" Dynamic AMOLED 2X, 120Hz' },
      { deviceId: 7, title: 'Процессор', description: 'Exynos 1480' },
      { deviceId: 7, title: 'Экран', description: '6.6" Super AMOLED, 120Hz' },
      { deviceId: 9, title: 'Процессор', description: 'Snapdragon 8 Gen 3' },
      { deviceId: 9, title: 'Экран', description: '6.36" AMOLED, 120Hz, Dolby Vision' },
      { deviceId: 10, title: 'Процессор', description: 'Dimensity 9200+' },
      { deviceId: 11, title: 'Процессор', description: 'Snapdragon 7s Gen 2' },
      { deviceId: 14, title: 'Процессор', description: 'Apple M2, 8-ядерный' },
      { deviceId: 14, title: 'Экран', description: '13.6" Liquid Retina, 500 нит' },
      { deviceId: 16, title: 'Процессор', description: 'Intel Core Ultra 9 / NVIDIA RTX 4070' },
      { deviceId: 17, title: 'Процессор', description: 'AMD Ryzen 7 7745HX / RTX 4060' },
      { deviceId: 20, title: 'Процессор', description: 'Apple M2, 8-ядерный CPU / 10-ядерный GPU' },
      { deviceId: 20, title: 'Экран', description: '12.9" Liquid Retina XDR, 120Hz ProMotion' },
      { deviceId: 21, title: 'Процессор', description: 'Apple M2' },
      { deviceId: 22, title: 'Процессор', description: 'Snapdragon 8 Gen 2 for Galaxy' },
      { deviceId: 25, title: 'Драйвер', description: '30 мм, динамический' },
      { deviceId: 25, title: 'Шумоподавление', description: 'Промышленно лучшее, адаптивное' },
      { deviceId: 28, title: 'Процессор', description: 'Apple S9 SiP, 64-битный' },
      { deviceId: 28, title: 'Экран', description: '1.9" LTPO OLED, Always-On, до 2000 нит' },
      { deviceId: 29, title: 'Процессор', description: 'Exynos W930, двухъядерный' },
      { deviceId: 30, title: 'Процессор', description: 'Snapdragon W5+ Gen 1' },
      { deviceId: 31, title: 'Процессор', description: 'Apple M3, 8-ядерный CPU / 10-ядерный GPU' },
      { deviceId: 34, title: 'Совместимость', description: 'iPhone 12 и новее, MagSafe-совместимые чехлы' },
      { deviceId: 35, title: 'Мощность', description: '45 Вт, USB-C, PPS' },
      { deviceId: 24, title: 'Шумоподавление', description: 'Активное, адаптивное, прозрачный режим' },
      { deviceId: 24, title: 'Звук', description: 'Пространственное аудио с динамическим отслеживанием' },
      { deviceId: 24, title: 'Управление', description: 'Сенсорное, регулировка громкости свайпом' },
      { deviceId: 24, title: 'Автономность', description: 'До 6 часов + 30 часов с кейсом' },
      { deviceId: 36, title: 'ssы', description: 'ssы' },
      { deviceId: 1, title: 'Процессор', description: 'Apple A17 Pro, 6-ядерный, 3 нм' },
      { deviceId: 1, title: 'Экран', description: '6.1" Super Retina XDR OLED, 120Hz ProMotion' },
      { deviceId: 1, title: 'Камера', description: 'Основная 48 Мп + ультраширокая 12 Мп + телеобъектив 12 Мп' },
      { deviceId: 1, title: 'Память', description: '256 ГБ / 512 ГБ / 1 ТБ, 8 ГБ RAM' },
      { deviceId: 1, title: 'Аккумулятор', description: 'До 23 часов видео, быстрая зарядка 27 Вт' },
    ],
    skipDuplicates: true,
  });
  console.log('Created device info');

  // 5. Device Images
  await prisma.deviceImage.createMany({
    data: [
      { deviceId: 24, img: '/uploads/devices/airpodspro2.jpg' },
      { deviceId: 36, img: '/uploads/devices/f6161ef6-3277-4876-8fa0-173241c29363.jpg' },
    ],
    skipDuplicates: true,
  });
  console.log('Created device images');

  // 6. Users
  await prisma.user.createMany({
    data: [
      { id: 1, email: 'admin@gmail.com', password: '$2b$10$xokm9YONzY3zC4EIcyx/0ef5cwz5va5RPQymakb8aWx46qizQeyLe', role: 'ADMIN' },
      { id: 2, email: 'client@example.com', password: '$2b$10$Vk7VrvEcvqxg2ZayAHfjtuEdcNARyMCiKoJPTaK99.dSZe9RtkKZC', role: 'CLIENT' },
      { id: 3, email: 'ivanov@gmail.com', password: '$2b$10$eQYP70UHVdAPR03rhNh1NuAI/XKZRKnvFusuDsYV1zqve4xIlx8ZO', role: 'CLIENT' },
      { id: 4, email: 'petrov@gmail.com', password: '$2b$10$NuUtHR02sj.YLgnetZOk7eR5FC2ng19Ms3U/6.Uv5paz.55kjEV1S', role: 'CLIENT' },
      { id: 5, email: 'maximov@gmail.com', password: '$2b$10$YVMVMAjfX.AQcKRa/9tWT.g0sTYbQdt3d.zY9gI5m1eD5KDqchR3a', role: 'CLIENT' },
      { id: 6, email: 'egorov@gmail.com', password: '$2b$10$hHM44.F3IdI7xcOpJApcKuSdC83AnXssVQKUi2X2tsJSjVEIPvaA2', role: 'CLIENT' },
      { id: 10, email: 'example@gmail.com', password: '$2b$10$pn7ya3Cbirfx6VB0F3mqHOp5nLx1YvW4HhX77G52jHRkO0Q2LlrK.', role: 'CLIENT' },
    ],
    skipDuplicates: true,
  });
  console.log('Created users');

  // 7. Discounts
  await prisma.discount.createMany({
    data: [
      { id: 1, deviceId: 24, value: 50.00, dateStart: new Date('2026-05-29T21:00:00'), dateEnd: new Date('2026-07-25T20:59:59') },
      { id: 2, deviceId: 36, value: 28.00, dateStart: new Date('2026-04-15T21:00:00'), dateEnd: new Date('2026-07-25T20:59:59') },
      { id: 7, deviceId: 1, value: 50.00, dateStart: new Date('2025-12-31T21:00:00'), dateEnd: new Date('2027-01-01T20:59:59') },
    ],
    skipDuplicates: true,
  });
  console.log('Created discounts');

  // 8. Ratings
  await prisma.rating.createMany({
    data: [
      { id: 1, userId: 2, deviceId: 1, rate: 5, hidden: false, description: 'Лучший смартфон! Камера потрясающая, батарея держит весь день.' },
      { id: 2, userId: 2, deviceId: 13, rate: 4, hidden: false, description: 'Мощный ноутбук, но тяжёлый. Для работы — идеально.' },
      { id: 3, userId: 2, deviceId: 24, rate: 5, hidden: false, description: 'Звук чистый, шумоподавление работает отлично. Рекомендую!' },
      { id: 4, userId: 2, deviceId: 28, rate: 3, hidden: false, description: 'Часы хорошие, но цена завышена. Батарея слабовата.' },
      { id: 5, userId: 3, deviceId: 5, rate: 5, hidden: false, description: 'Galaxy S24 Ultra — монстр! Экран, камера, производительность — всё на высоте.' },
      { id: 6, userId: 3, deviceId: 20, rate: 4, hidden: false, description: 'iPad Pro отличный, но для простых задач избыточен.' },
      { id: 7, userId: 3, deviceId: 25, rate: 5, hidden: false, description: 'Sony WH-1000XM5 — лучшие наушники для путешествий. Тишина полная!' },
      { id: 8, userId: 4, deviceId: 2, rate: 4, hidden: false, description: 'iPhone 15 — надёжный, но без особых инноваций.' },
      { id: 9, userId: 4, deviceId: 6, rate: 3, hidden: false, description: 'Galaxy S24 хорош, но перегревается в играх.' },
      { id: 10, userId: 4, deviceId: 14, rate: 5, hidden: false, description: 'MacBook Air M2 — лёгкий, быстрый, батарея на весь день. Идеален для учёбы!' },
      { id: 11, userId: 4, deviceId: 26, rate: 4, hidden: false, description: 'Buds2 Pro удобные, звук хороший, но кейс скользкий.' },
      { id: 12, userId: 4, deviceId: 31, rate: 2, hidden: false, description: 'iMac красивый, но за эти деньги ожидал больше производительности.' },
      { id: 13, userId: 5, deviceId: 9, rate: 5, hidden: false, description: 'Xiaomi 14 Pro — флагман за разумные деньги. Камера впечатляет!' },
      { id: 14, userId: 5, deviceId: 16, rate: 4, hidden: false, description: 'ASUS ROG Zephyrus — игровой зверь. Шумный, но мощный.' },
      { id: 15, userId: 6, deviceId: 11, rate: 5, hidden: false, description: 'Redmi Note 13 Pro — топ за свои деньги! Экран сочный, камера достойная.' },
      { id: 16, userId: 6, deviceId: 22, rate: 4, hidden: false, description: 'Galaxy Tab S9 отличный планшет, но дорогой.' },
      { id: 17, userId: 6, deviceId: 30, rate: 3, hidden: false, description: 'Xiaomi Watch S3 нормальные, но функционал ограничен по сравнению с Apple.' },
      { id: 45, userId: 10, deviceId: 24, rate: 3, hidden: true, description: 'example example examples asd' },
    ],
    skipDuplicates: true,
  });
  console.log('Created ratings');

  // 9. Delivery Options
  await prisma.deliveryOption.createMany({
    data: [
      { id: 1, name: 'Доставка обычная', type: 'DELIVERY', price: 100.00, description: 'Срок: 2-3 рабочих дня', isActive: true, sortOrder: 1 },
      { id: 2, name: 'Доставка экспресс', type: 'DELIVERY', price: 150.00, description: 'Срок: 1 рабочий день', isActive: true, sortOrder: 2 },
      { id: 3, name: 'Самовывоз Москва Центр', type: 'PICKUP', address: 'г. Москва, Тверская улица, 15, офис 305', description: 'Работаем с 9:00 до 21:00, без выходных', isActive: true, sortOrder: 10 },
      { id: 4, name: 'Самовывоз СПб Невский', type: 'PICKUP', address: 'г. Санкт-Петербург, Невский проспект, 28', description: 'Работаем с 10:00 до 20:00', isActive: true, sortOrder: 11 },
      { id: 5, name: 'Самовывоз Казань Баумана', type: 'PICKUP', address: 'г. Казань, ул. Баумана, 42', description: 'Работаем с 9:00 до 22:00', isActive: true, sortOrder: 12 },
    ],
    skipDuplicates: true,
  });
  console.log('Created delivery options');

  // 10. Baskets
  await prisma.basket.createMany({
    data: [
      { id: 1, userId: 2, paidAt: new Date('2026-05-02T15:25:24.991'), deliveredAt: new Date('2026-06-24T12:23:26.341'), createdAt: new Date('2026-05-03T15:25:24.991'), deliveryOptionId: 1 },
      { id: 2, userId: 2, paidAt: new Date('2026-05-12T15:25:24.991'), deliveredAt: new Date('2026-05-13T15:25:24.991'), createdAt: new Date('2026-05-13T15:25:24.991'), deliveryOptionId: 1 },
      { id: 3, userId: 2, paidAt: new Date('2026-05-19T15:25:24.991'), deliveredAt: new Date('2026-06-25T11:32:48.174'), createdAt: new Date('2026-05-20T15:25:24.991'), deliveryOptionId: 2 },
      { id: 4, userId: 3, paidAt: new Date('2026-04-27T15:25:24.991'), deliveredAt: new Date('2026-04-28T15:25:24.991'), createdAt: new Date('2026-04-28T15:25:24.991'), deliveryOptionId: 2 },
      { id: 5, userId: 3, paidAt: new Date('2026-05-17T15:25:24.991'), deliveredAt: new Date('2026-05-18T15:25:24.991'), createdAt: new Date('2026-05-18T15:25:24.991'), deliveryOptionId: 3 },
      { id: 6, userId: 4, paidAt: new Date('2026-04-22T15:25:24.991'), deliveredAt: new Date('2026-04-23T15:25:24.991'), createdAt: new Date('2026-04-23T15:25:24.991'), deliveryOptionId: 3 },
      { id: 7, userId: 4, paidAt: new Date('2026-05-07T15:25:24.991'), deliveredAt: new Date('2026-05-08T15:25:24.991'), createdAt: new Date('2026-05-08T15:25:24.991'), deliveryOptionId: 4 },
      { id: 8, userId: 4, paidAt: new Date('2026-05-15T15:25:24.991'), deliveredAt: new Date('2026-06-24T12:11:20.673'), createdAt: new Date('2026-05-16T15:25:24.991'), deliveryOptionId: 4 },
      { id: 9, userId: 5, paidAt: new Date('2026-05-04T15:25:24.991'), deliveredAt: new Date('2026-05-05T15:25:24.991'), createdAt: new Date('2026-05-05T15:25:24.991'), deliveryOptionId: 5 },
      { id: 10, userId: 5, paidAt: new Date('2026-05-18T15:25:24.991'), deliveredAt: new Date('2026-06-25T11:51:35.185'), createdAt: new Date('2026-05-19T15:25:24.991'), deliveryOptionId: 5 },
      { id: 11, userId: 6, paidAt: new Date('2026-04-30T15:25:24.991'), deliveredAt: new Date('2026-05-01T15:25:24.991'), createdAt: new Date('2026-05-01T15:25:24.991'), deliveryOptionId: 1 },
      { id: 12, userId: 6, paidAt: new Date('2026-05-10T15:25:24.991'), deliveredAt: new Date('2026-05-11T15:25:24.991'), createdAt: new Date('2026-05-11T15:25:24.991'), deliveryOptionId: 1 },
      { id: 13, userId: 6, paidAt: new Date('2026-05-21T15:25:24.991'), deliveredAt: new Date('2026-05-22T15:25:24.991'), createdAt: new Date('2026-05-22T15:25:24.991'), deliveryOptionId: 2 },
      { id: 20, userId: 10, paidAt: new Date('2026-05-29T12:16:07.75'), deliveredAt: new Date('2026-06-25T11:51:59.169'), createdAt: new Date('2026-05-29T13:36:44.08'), deliveryOptionId: 2 },
      { id: 21, userId: 3, paidAt: new Date('2026-05-29T12:18:19.502'), createdAt: new Date('2026-05-29T12:18:19.502') },
      { id: 61, userId: 10, paidAt: new Date('2026-06-23T10:53:39.862'), createdAt: new Date('2026-06-23T10:53:39.862') },
    ],
    skipDuplicates: true,
  });
  console.log('Created baskets');

  // 11. Basket Devices
  await prisma.basketDevice.createMany({
    data: [
      { basketId: 1, deviceId: 1, quantity: 1 },
      { basketId: 1, deviceId: 24, quantity: 1 },
      { basketId: 2, deviceId: 14, quantity: 1 },
      { basketId: 2, deviceId: 34, quantity: 2 },
      { basketId: 3, deviceId: 29, quantity: 1 },
      { basketId: 4, deviceId: 5, quantity: 1 },
      { basketId: 5, deviceId: 20, quantity: 1 },
      { basketId: 5, deviceId: 25, quantity: 1 },
      { basketId: 6, deviceId: 2, quantity: 1 },
      { basketId: 6, deviceId: 6, quantity: 1 },
      { basketId: 6, deviceId: 26, quantity: 2 },
      { basketId: 7, deviceId: 14, quantity: 1 },
      { basketId: 7, deviceId: 18, quantity: 1 },
      { basketId: 8, deviceId: 34, quantity: 1 },
      { basketId: 8, deviceId: 35, quantity: 1 },
      { basketId: 9, deviceId: 9, quantity: 1 },
      { basketId: 9, deviceId: 23, quantity: 1 },
      { basketId: 10, deviceId: 16, quantity: 1 },
      { basketId: 11, deviceId: 11, quantity: 2 },
      { basketId: 12, deviceId: 22, quantity: 1 },
      { basketId: 12, deviceId: 30, quantity: 1 },
      { basketId: 13, deviceId: 1, quantity: 1 },
      { basketId: 13, deviceId: 24, quantity: 1 },
      { basketId: 20, deviceId: 3, quantity: 2 },
      { basketId: 20, deviceId: 7, quantity: 2 },
    ],
    skipDuplicates: true,
  });
  console.log('Created basket devices');

  console.log('Database seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });