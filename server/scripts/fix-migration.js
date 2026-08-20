// server/scripts/fix-migration.js
// Простой скрипт для удаления записи о сломанной миграции
// Использует pg напрямую — не требует инициализации PrismaClient

const { Pool } = require('pg');

async function main() {
  console.log('🔧 Fixing failed migration state...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.query(`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20260820_add_unique_indexes_for_seed'
    `);
    console.log('✅ Deleted failed migration record!');
  } catch (error) {
    // Если таблица ещё не существует — это ок, просто пропускаем
    if (error.message?.includes('_prisma_migrations')) {
      console.log('⚠️ _prisma_migrations table not found — skipping fix');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
  
  console.log('✅ Fix complete!');
}

main().catch(e => { 
  console.error('❌ Error:', e); 
  process.exit(1); 
});