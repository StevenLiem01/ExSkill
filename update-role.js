const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating roles...");
  await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE 'USER'`);
  await prisma.$executeRawUnsafe(`UPDATE users SET role = 'USER' WHERE role = 'STUDENT'`);
  console.log("Updated!");
}
main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
