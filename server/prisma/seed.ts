// server/prisma/seed.ts

import "dotenv/config";
import { Pool } from 'pg';

async function main() {
  console.log('🌱 Starting minimal database seed...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const now = new Date().toISOString();

    // === 1. Бренды (НЕТ createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "brand" (id, name) VALUES 
      (1, 'Apple'),
      (2, 'Samsung')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Created 2 brands');

    // === 2. Типы (НЕТ createdAt/updatedAt) ===
    await pool.query(`
      INSERT INTO "type" (id, name) VALUES 
      (1, 'Смартфоны'),
      (2, 'Ноутбуки')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Created 2 types');

    // === 3. Устройства (ЕСТЬ createdAt/updatedAt) ===
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