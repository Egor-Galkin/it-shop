// server/prisma/seed.ts

import "dotenv/config";
import { Pool } from 'pg';

async function main() {
  console.log('Starting database seed...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const now = new Date().toISOString();

    // === 1. Brands (нет createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "brand" (id, name) VALUES 
      (1, 'Apple'),
      (2, 'Samsung'),
      (3, 'Xiaomi'),
      (4, 'Sony'),
      (5, 'Huawei'),
      (6, 'Logitech'),
      (7, 'ASUS'),
      (8, 'Lenovo')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Created brands');

    // === 2. Types (нет createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "type" (id, name) VALUES 
      (1, 'Смартфоны'),
      (2, 'Ноутбуки'),
      (3, 'Планшеты'),
      (4, 'Наушники'),
      (5, 'Умные часы'),
      (6, 'Аксессуары'),
      (7, 'Компьютеры')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Created types');

    // === 3. Devices (есть createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "device" (
        id, name, price, rating, img, "brandId", "typeId", "createdAt", "updatedAt"
      ) VALUES 
      (1, 'iPhone 15 Pro', 119990.00, 5.00, '/uploads/devices/iphone15pro.jpg', 1, 1, '${now}', '${now}'),
      (2, 'iPhone 15', 89990.00, 4.00, '/uploads/devices/iphone15.jpg', 1, 1, '${now}', '${now}'),
      (3, 'iPhone 14 Pro', 99990.00, null, '/uploads/devices/iphone14pro.jpg', 1, 1, '${now}', '${now}'),
      (4, 'iPhone SE (2024)', 49990.00, null, '/uploads/devices/iphonese.jpg', 1, 1, '${now}', '${now}'),
      (5, 'Galaxy S24 Ultra', 109990.00, 5.00, '/uploads/devices/s24ultra.jpg', 2, 1, '${now}', '${now}'),
      (6, 'Galaxy S24', 79990.00, 3.00, '/uploads/devices/s24.jpg', 2, 1, '${now}', '${now}'),
      (7, 'Galaxy A55', 39990.00, null, '/uploads/devices/a55.jpg', 2, 1, '${now}', '${now}'),
      (8, 'Galaxy Z Fold5', 149990.00, null, '/uploads/devices/zfold5.jpg', 2, 1, '${now}', '${now}'),
      (9, 'Xiaomi 14 Pro', 79990.00, 5.00, '/uploads/devices/xiaomi14pro.jpg', 3, 1, '${now}', '${now}'),
      (10, 'Xiaomi 13T', 49990.00, null, '/uploads/devices/xiaomi13t.jpg', 3, 1, '${now}', '${now}'),
      (11, 'Redmi Note 13 Pro', 29990.00, 5.00, '/uploads/devices/redminote13.jpg', 3, 1, '${now}', '${now}'),
      (12, 'POCO F5', 34990.00, null, '/uploads/devices/pocof5.jpg', 3, 1, '${now}', '${now}'),
      (13, 'MacBook Pro 16" M3', 249990.00, 4.00, '/uploads/devices/mbp16m3.jpg', 1, 2, '${now}', '${now}'),
      (14, 'MacBook Air 13" M2', 119990.00, 5.00, '/uploads/devices/mba13m2.jpg', 1, 2, '${now}', '${now}'),
      (15, 'MacBook Pro 14" M3', 199990.00, null, '/uploads/devices/mbp14m3.jpg', 1, 2, '${now}', '${now}'),
      (16, 'ASUS ROG Zephyrus G16', 189990.00, 4.00, '/uploads/devices/zephyrusg16.jpg', 7, 2, '${now}', '${now}'),
      (17, 'Lenovo Legion 5 Pro', 149990.00, null, '/uploads/devices/legion5pro.jpg', 8, 2, '${now}', '${now}'),
      (18, 'ASUS Vivobook 15', 59990.00, null, '/uploads/devices/vivobook15.jpg', 7, 2, '${now}', '${now}'),
      (19, 'Lenovo IdeaPad 3', 44990.00, null, '/uploads/devices/ideapad3.jpg', 8, 2, '${now}', '${now}'),
      (20, 'iPad Pro 12.9" M2', 129990.00, 4.00, '/uploads/devices/ipadpro129.jpg', 1, 3, '${now}', '${now}'),
      (21, 'iPad Air 11"', 69990.00, null, '/uploads/devices/ipadair11.jpg', 1, 3, '${now}', '${now}'),
      (22, 'Samsung Galaxy Tab S9', 79990.00, 4.00, '/uploads/devices/tabs9.jpg', 2, 3, '${now}', '${now}'),
      (23, 'Xiaomi Pad 6', 34990.00, null, '/uploads/devices/xiaomipad6.jpg', 3, 3, '${now}', '${now}'),
      (24, 'AirPods Pro 2', 24990.00, 4.00, '/uploads/devices/airpodspro2.jpg', 1, 4, '${now}', '${now}'),
      (25, 'Sony WH-1000XM5', 34990.00, 5.00, '/uploads/devices/sonywh1000xm5.jpg', 4, 4, '${now}', '${now}'),
      (26, 'Samsung Galaxy Buds2 Pro', 19990.00, 4.00, '/uploads/devices/buds2pro.jpg', 2, 4, '${now}', '${now}'),
      (27, 'Xiaomi Buds 4 Pro', 14990.00, null, '/uploads/devices/buds4pro.jpg', 3, 4, '${now}', '${now}'),
      (28, 'Apple Watch Series 9', 44990.00, 3.00, '/uploads/devices/watchs9.jpg', 1, 5, '${now}', '${now}'),
      (29, 'Samsung Galaxy Watch6', 34990.00, null, '/uploads/devices/watch6.jpg', 2, 5, '${now}', '${now}'),
      (30, 'Xiaomi Watch S3', 19990.00, 3.00, '/uploads/devices/watchs3.jpg', 3, 5, '${now}', '${now}'),
      (31, 'iMac 24" M3', 159990.00, null, '/uploads/devices/imac24m3.jpg', 1, 7, '${now}', '${now}'),
      (32, 'Mac Studio M2 Ultra', 349990.00, null, '/uploads/devices/macstudio.jpg', 1, 7, '${now}', '${now}'),
      (33, 'ASUS ROG Desktop', 129990.00, null, '/uploads/devices/rogdesktop.jpg', 7, 7, '${now}', '${now}'),
      (34, 'MagSafe Charger', 4990.00, null, '/uploads/devices/magsafe.jpg', 1, 6, '${now}', '${now}'),
      (35, 'Samsung 45W Charger', 3990.00, null, '/uploads/devices/samsung45w.jpg', 2, 6, '${now}', '${now}'),
      (36, 'Device', 101.00, null, '/uploads/devices/506c9f01-7630-4de5-8de7-b6b578e112a6.jpg', 7, 7, '${now}', '${now}')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Created devices');

    // === 4. Device Info (есть createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "device_info" ("deviceId", title, description, "createdAt", "updatedAt") VALUES 
      (2, 'Процессор', 'Apple A16 Bionic, 6-ядерный', '${now}', '${now}'),
      (2, 'Экран', '6.1" Super Retina XDR OLED, 60Hz', '${now}', '${now}'),
      (2, 'Камера', 'Основная 48 Мп + ультраширокая 12 Мп', '${now}', '${now}'),
      (2, 'Память', '128 ГБ / 256 ГБ / 512 ГБ', '${now}', '${now}'),
      (5, 'Процессор', 'Snapdragon 8 Gen 3 for Galaxy', '${now}', '${now}'),
      (5, 'Экран', '6.8" Dynamic AMOLED 2X, 120Hz, S Pen', '${now}', '${now}'),
      (5, 'Камера', '200 Мп основная + 50 Мп телеобъектив + 12 Мп ультраширокая', '${now}', '${now}'),
      (5, 'Память', '256 ГБ / 512 ГБ / 1 ТБ, 12 ГБ RAM', '${now}', '${now}'),
      (5, 'Аккумулятор', '5000 мАч, зарядка 45 Вт', '${now}', '${now}'),
      (13, 'Процессор', 'Apple M3 Pro / M3 Max, до 16 ядер', '${now}', '${now}'),
      (13, 'Экран', '16.2" Liquid Retina XDR, 120Hz ProMotion', '${now}', '${now}'),
      (13, 'Память', '18-128 ГБ унифицированной, 512 ГБ - 8 ТБ SSD', '${now}', '${now}'),
      (13, 'Порты', '3x Thunderbolt 4, HDMI, SDXC, MagSafe', '${now}', '${now}'),
      (13, 'Автономность', 'До 22 часов работы', '${now}', '${now}'),
      (3, 'Процессор', 'Apple A16 Bionic', '${now}', '${now}'),
      (3, 'Экран', '6.1" OLED, 120Hz', '${now}', '${now}'),
      (3, 'Камера', '48 Мп основная + 12 Мп', '${now}', '${now}'),
      (6, 'Процессор', 'Exynos 2400 / Snapdragon 8 Gen 3', '${now}', '${now}'),
      (6, 'Экран', '6.2" Dynamic AMOLED 2X, 120Hz', '${now}', '${now}'),
      (7, 'Процессор', 'Exynos 1480', '${now}', '${now}'),
      (7, 'Экран', '6.6" Super AMOLED, 120Hz', '${now}', '${now}'),
      (9, 'Процессор', 'Snapdragon 8 Gen 3', '${now}', '${now}'),
      (9, 'Экран', '6.36" AMOLED, 120Hz, Dolby Vision', '${now}', '${now}'),
      (10, 'Процессор', 'Dimensity 9200+', '${now}', '${now}'),
      (11, 'Процессор', 'Snapdragon 7s Gen 2', '${now}', '${now}'),
      (14, 'Процессор', 'Apple M2, 8-ядерный', '${now}', '${now}'),
      (14, 'Экран', '13.6" Liquid Retina, 500 нит', '${now}', '${now}'),
      (16, 'Процессор', 'Intel Core Ultra 9 / NVIDIA RTX 4070', '${now}', '${now}'),
      (17, 'Процессор', 'AMD Ryzen 7 7745HX / RTX 4060', '${now}', '${now}'),
      (20, 'Процессор', 'Apple M2, 8-ядерный CPU / 10-ядерный GPU', '${now}', '${now}'),
      (20, 'Экран', '12.9" Liquid Retina XDR, 120Hz ProMotion', '${now}', '${now}'),
      (21, 'Процессор', 'Apple M2', '${now}', '${now}'),
      (22, 'Процессор', 'Snapdragon 8 Gen 2 for Galaxy', '${now}', '${now}'),
      (25, 'Драйвер', '30 мм, динамический', '${now}', '${now}'),
      (25, 'Шумоподавление', 'Промышленно лучшее, адаптивное', '${now}', '${now}'),
      (28, 'Процессор', 'Apple S9 SiP, 64-битный', '${now}', '${now}'),
      (28, 'Экран', '1.9" LTPO OLED, Always-On, до 2000 нит', '${now}', '${now}'),
      (29, 'Процессор', 'Exynos W930, двухъядерный', '${now}', '${now}'),
      (30, 'Процессор', 'Snapdragon W5+ Gen 1', '${now}', '${now}'),
      (31, 'Процессор', 'Apple M3, 8-ядерный CPU / 10-ядерный GPU', '${now}', '${now}'),
      (34, 'Совместимость', 'iPhone 12 и новее, MagSafe-совместимые чехлы', '${now}', '${now}'),
      (35, 'Мощность', '45 Вт, USB-C, PPS', '${now}', '${now}'),
      (24, 'Шумоподавление', 'Активное, адаптивное, прозрачный режим', '${now}', '${now}'),
      (24, 'Звук', 'Пространственное аудио с динамическим отслеживанием', '${now}', '${now}'),
      (24, 'Управление', 'Сенсорное, регулировка громкости свайпом', '${now}', '${now}'),
      (24, 'Автономность', 'До 6 часов + 30 часов с кейсом', '${now}', '${now}'),
      (36, 'ssы', 'ssы', '${now}', '${now}'),
      (1, 'Процессор', 'Apple A17 Pro, 6-ядерный, 3 нм', '${now}', '${now}'),
      (1, 'Экран', '6.1" Super Retina XDR OLED, 120Hz ProMotion', '${now}', '${now}'),
      (1, 'Камера', 'Основная 48 Мп + ультраширокая 12 Мп + телеобъектив 12 Мп', '${now}', '${now}'),
      (1, 'Память', '256 ГБ / 512 ГБ / 1 ТБ, 8 ГБ RAM', '${now}', '${now}'),
      (1, 'Аккумулятор', 'До 23 часов видео, быстрая зарядка 27 Вт', '${now}', '${now}')
      ON CONFLICT ("deviceId", title) DO NOTHING;
    `);
    console.log('Created device info');

    // === 5. Device Images (есть createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "device_image" ("deviceId", img, "createdAt", "updatedAt") VALUES 
      (24, '/uploads/devices/airpodspro2.jpg', '${now}', '${now}'),
      (36, '/uploads/devices/f6161ef6-3277-4876-8fa0-173241c29363.jpg', '${now}', '${now}')
      ON CONFLICT ("deviceId", img) DO NOTHING;
    `);
    console.log('Created device images');

    // === 6. Users (есть createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "user" (id, email, password, role, "createdAt", "updatedAt") VALUES 
      (1, 'admin@gmail.com', '$2b$10$xokm9YONzY3zC4EIcyx/0ef5cwz5va5RPQymakb8aWx46qizQeyLe', 'ADMIN', '${now}', '${now}'),
      (2, 'client@example.com', '$2b$10$Vk7VrvEcvqxg2ZayAHfjtuEdcNARyMCiKoJPTaK99.dSZe9RtkKZC', 'CLIENT', '${now}', '${now}'),
      (3, 'ivanov@gmail.com', '$2b$10$eQYP70UHVdAPR03rhNh1NuAI/XKZRKnvFusuDsYV1zqve4xIlx8ZO', 'CLIENT', '${now}', '${now}'),
      (4, 'petrov@gmail.com', '$2b$10$NuUtHR02sj.YLgnetZOk7eR5FC2ng19Ms3U/6.Uv5paz.55kjEV1S', 'CLIENT', '${now}', '${now}'),
      (5, 'maximov@gmail.com', '$2b$10$YVMVMAjfX.AQcKRa/9tWT.g0sTYbQdt3d.zY9gI5m1eD5KDqchR3a', 'CLIENT', '${now}', '${now}'),
      (6, 'egorov@gmail.com', '$2b$10$hHM44.F3IdI7xcOpJApcKuSdC83AnXssVQKUi2X2tsJSjVEIPvaA2', 'CLIENT', '${now}', '${now}'),
      (10, 'example@gmail.com', '$2b$10$pn7ya3Cbirfx6VB0F3mqHOp5nLx1YvW4HhX77G52jHRkO0Q2LlrK.', 'CLIENT', '${now}', '${now}')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Created users');

    // === 7. Discounts (есть createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "discount" (id, "deviceId", value, "dateStart", "dateEnd", "createdAt", "updatedAt") VALUES 
      (1, 24, 50.00, '2026-05-29T21:00:00', '2026-07-25T20:59:59', '${now}', '${now}'),
      (2, 36, 28.00, '2026-04-15T21:00:00', '2026-07-25T20:59:59', '${now}', '${now}'),
      (7, 1, 50.00, '2025-12-31T21:00:00', '2027-01-01T20:59:59', '${now}', '${now}')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Created discounts');

    // === 8. Ratings (ДОБАВЛЕНО updatedAt, так как в БД он есть!) ===
    await pool.query(`
      INSERT INTO "rating" (id, "userId", "deviceId", rate, hidden, description, "createdAt", "updatedAt") VALUES 
      (1, 2, 1, 5, false, 'Лучший смартфон! Камера потрясающая, батарея держит весь день.', '${now}', '${now}'),
      (2, 2, 13, 4, false, 'Мощный ноутбук, но тяжёлый. Для работы — идеально.', '${now}', '${now}'),
      (3, 2, 24, 5, false, 'Звук чистый, шумоподавление работает отлично. Рекомендую!', '${now}', '${now}'),
      (4, 2, 28, 3, false, 'Часы хорошие, но цена завышена. Батарея слабовата.', '${now}', '${now}'),
      (5, 3, 5, 5, false, 'Galaxy S24 Ultra — монстр! Экран, камера, производительность — всё на высоте.', '${now}', '${now}'),
      (6, 3, 20, 4, false, 'iPad Pro отличный, но для простых задач избыточен.', '${now}', '${now}'),
      (7, 3, 25, 5, false, 'Sony WH-1000XM5 — лучшие наушники для путешествий. Тишина полная!', '${now}', '${now}'),
      (8, 4, 2, 4, false, 'iPhone 15 — надёжный, но без особых инноваций.', '${now}', '${now}'),
      (9, 4, 6, 3, false, 'Galaxy S24 хорош, но перегревается в играх.', '${now}', '${now}'),
      (10, 4, 14, 5, false, 'MacBook Air M2 — лёгкий, быстрый, батарея на весь день. Идеален для учёбы!', '${now}', '${now}'),
      (11, 4, 26, 4, false, 'Buds2 Pro удобные, звук хороший, но кейс скользкий.', '${now}', '${now}'),
      (12, 4, 31, 2, false, 'iMac красивый, но за эти деньги ожидал больше производительности.', '${now}', '${now}'),
      (13, 5, 9, 5, false, 'Xiaomi 14 Pro — флагман за разумные деньги. Камера впечатляет!', '${now}', '${now}'),
      (14, 5, 16, 4, false, 'ASUS ROG Zephyrus — игровой зверь. Шумный, но мощный.', '${now}', '${now}'),
      (15, 6, 11, 5, false, 'Redmi Note 13 Pro — топ за свои деньги! Экран сочный, камера достойная.', '${now}', '${now}'),
      (16, 6, 22, 4, false, 'Galaxy Tab S9 отличный планшет, но дорогой.', '${now}', '${now}'),
      (17, 6, 30, 3, false, 'Xiaomi Watch S3 нормальные, но функционал ограничен по сравнению с Apple.', '${now}', '${now}'),
      (45, 10, 24, 3, true, 'example example examples asd', '${now}', '${now}')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Created ratings');

    // === 9. Delivery Options (есть createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "delivery_option" (id, name, type, price, address, description, "isActive", "sortOrder", "createdAt", "updatedAt") VALUES 
      (1, 'Доставка обычная', 'DELIVERY', 100.00, null, 'Срок: 2-3 рабочих дня', true, 1, '${now}', '${now}'),
      (2, 'Доставка экспресс', 'DELIVERY', 150.00, null, 'Срок: 1 рабочий день', true, 2, '${now}', '${now}'),
      (3, 'Самовывоз Москва Центр', 'PICKUP', null, 'г. Москва, Тверская улица, 15, офис 305', 'Работаем с 9:00 до 21:00, без выходных', true, 10, '${now}', '${now}'),
      (4, 'Самовывоз СПб Невский', 'PICKUP', null, 'г. Санкт-Петербург, Невский проспект, 28', 'Работаем с 10:00 до 20:00', true, 11, '${now}', '${now}'),
      (5, 'Самовывоз Казань Баумана', 'PICKUP', null, 'г. Казань, ул. Баумана, 42', 'Работаем с 9:00 до 22:00', true, 12, '${now}', '${now}')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Created delivery options');

    // === 10. Baskets (есть createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "basket" (id, "userId", "paidAt", "deliveredAt", "createdAt", "updatedAt", "deliveryOptionId") VALUES 
      (1, 2, '2026-05-02T15:25:24.991', '2026-06-24T12:23:26.341', '2026-05-03T15:25:24.991', '${now}', 1),
      (2, 2, '2026-05-12T15:25:24.991', '2026-05-13T15:25:24.991', '2026-05-13T15:25:24.991', '${now}', 1),
      (3, 2, '2026-05-19T15:25:24.991', '2026-06-25T11:32:48.174', '2026-05-20T15:25:24.991', '${now}', 2),
      (4, 3, '2026-04-27T15:25:24.991', '2026-04-28T15:25:24.991', '2026-04-28T15:25:24.991', '${now}', 2),
      (5, 3, '2026-05-17T15:25:24.991', '2026-05-18T15:25:24.991', '2026-05-18T15:25:24.991', '${now}', 3),
      (6, 4, '2026-04-22T15:25:24.991', '2026-04-23T15:25:24.991', '2026-04-23T15:25:24.991', '${now}', 3),
      (7, 4, '2026-05-07T15:25:24.991', '2026-05-08T15:25:24.991', '2026-05-08T15:25:24.991', '${now}', 4),
      (8, 4, '2026-05-15T15:25:24.991', '2026-06-24T12:11:20.673', '2026-05-16T15:25:24.991', '${now}', 4),
      (9, 5, '2026-05-04T15:25:24.991', '2026-05-05T15:25:24.991', '2026-05-05T15:25:24.991', '${now}', 5),
      (10, 5, '2026-05-18T15:25:24.991', '2026-06-25T11:51:35.185', '2026-05-19T15:25:24.991', '${now}', 5),
      (11, 6, '2026-04-30T15:25:24.991', '2026-05-01T15:25:24.991', '2026-05-01T15:25:24.991', '${now}', 1),
      (12, 6, '2026-05-10T15:25:24.991', '2026-05-11T15:25:24.991', '2026-05-11T15:25:24.991', '${now}', 1),
      (13, 6, '2026-05-21T15:25:24.991', '2026-05-22T15:25:24.991', '2026-05-22T15:25:24.991', '${now}', 2),
      (20, 10, '2026-05-29T12:16:07.75', '2026-06-25T11:51:59.169', '2026-05-29T13:36:44.08', '${now}', 2),
      (21, 3, '2026-05-29T12:18:19.502', null, '2026-05-29T12:18:19.502', '${now}', null),
      (61, 10, '2026-06-23T10:53:39.862', null, '2026-06-23T10:53:39.862', '${now}', null)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Created baskets');

    // === 11. Basket Devices (нет createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "basket_device" ("basketId", "deviceId", quantity) VALUES 
      (1, 1, 1),
      (1, 24, 1),
      (2, 14, 1),
      (2, 34, 2),
      (3, 29, 1),
      (4, 5, 1),
      (5, 20, 1),
      (5, 25, 1),
      (6, 2, 1),
      (6, 6, 1),
      (6, 26, 2),
      (7, 14, 1),
      (7, 18, 1),
      (8, 34, 1),
      (8, 35, 1),
      (9, 9, 1),
      (9, 23, 1),
      (10, 16, 1),
      (11, 11, 2),
      (12, 22, 1),
      (12, 30, 1),
      (13, 1, 1),
      (13, 24, 1),
      (20, 3, 2),
      (20, 7, 2)
      ON CONFLICT ("basketId", "deviceId") DO NOTHING;
    `);
    console.log('Created basket devices');

    console.log('Database seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();