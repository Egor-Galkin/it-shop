// server/prisma/seed.ts

// Загружаем переменные окружения
import "dotenv/config";
// Импортируем нативный PostgreSQL клиент (уже установлен в зависимостях)
import { Pool } from 'pg';

async function main() {
  console.log('🌱 Starting minimal database seed...');

  // Создаём подключение к БД напрямую
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // === 1. Бренды ===
    await pool.query(`
      INSERT INTO "brand" (id, name) VALUES 
      (1, 'Apple'),
      (2, 'Samsung')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Created 2 brands');

    // === 2. Типы ===
    await pool.query(`
      INSERT INTO "type" (id, name) VALUES 
      (1, 'Смартфоны'),
      (2, 'Ноутбуки')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Created 2 types');

    // === 3. Устройства ===
    await pool.query(`
      INSERT INTO "device" (id, name, price, rating, img, "brandId", "typeId") VALUES 
      (1, 'iPhone 15 Pro', 119990.00, 5.00, '/uploads/devices/iphone15pro.jpg', 1, 1)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Created 1 device');

    console.log('🎉 Minimal seed completed!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    // Закрываем подключение
    await pool.end();
  }
}

main();