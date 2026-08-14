// server/prisma/seed.ts

import "dotenv/config";
import { Pool } from 'pg';

async function main() {
  console.log('🌱 Starting minimal database seed...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Текущее время для timestamp-полей
    const now = new Date().toISOString();

    // === 1. Бренды ===
    await pool.query(`
      INSERT INTO "brand" (id, name, "createdAt", "updatedAt") VALUES 
      (1, 'Apple', '${now}', '${now}'),
      (2, 'Samsung', '${now}', '${now}')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Created 2 brands');

    // === 2. Типы ===
    await pool.query(`
      INSERT INTO "type" (id, name, "createdAt", "updatedAt") VALUES 
      (1, 'Смартфоны', '${now}', '${now}'),
      (2, 'Ноутбуки', '${now}', '${now}')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Created 2 types');

    // === 3. Устройства (добавляем createdAt и updatedAt) ===
    await pool.query(`
      INSERT INTO "device" (
        id, name, price, rating, img, "brandId", "typeId", "createdAt", "updatedAt"
      ) VALUES 
      (
        1, 
        'iPhone 15 Pro', 
        119990.00, 
        5.00, 
        '/uploads/devices/iphone15pro.jpg', 
        1, 
        1,
        '${now}',
        '${now}'
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Created 1 device');

    console.log('🎉 Minimal seed completed!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();