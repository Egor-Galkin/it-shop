// server/scripts/fix-migration.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing failed migration state...');
  
  await prisma.$executeRaw`
    DELETE FROM "_prisma_migrations" 
    WHERE migration_name = '20260820_add_unique_indexes_for_seed'
  `;
  
  console.log('✅ Fixed!');
}

main()
  .catch(e => { 
    console.error('❌ Error:', e); 
    process.exit(1); 
  })
  .finally(() => prisma.$disconnect());