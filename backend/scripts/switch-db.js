const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2]; // 'postgres' or 'sqlite'
const prismaDir = path.resolve(__dirname, '../prisma');

if (target === 'postgres' || target === 'postgresql') {
  const source = path.join(prismaDir, 'schema.postgresql.prisma');
  const dest = path.join(prismaDir, 'schema.prisma');
  fs.copyFileSync(source, dest);
  console.log('[Database Switcher] Switched Prisma schema to PostgreSQL.');
} else if (target === 'sqlite') {
  const source = path.join(prismaDir, 'schema.sqlite.prisma');
  const dest = path.join(prismaDir, 'schema.prisma');
  fs.copyFileSync(source, dest);
  console.log('[Database Switcher] Switched Prisma schema to SQLite.');
} else {
  console.error('[Database Switcher] Usage: node scripts/switch-db.js [postgres|sqlite]');
  process.exit(1);
}

try {
  console.log('[Database Switcher] Running prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch (err) {
  console.error('[Database Switcher] Failed to generate Prisma Client:', err.message);
  process.exit(1);
}
