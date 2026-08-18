const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const skills = [
    { name: 'JavaScript', category: 'IT' },
    { name: 'React', category: 'IT' },
    { name: 'Next.js', category: 'IT' },
    { name: 'Python', category: 'IT' },
    { name: 'Machine Learning', category: 'IT' },
    { name: 'Digital Marketing', category: 'Bisnis' },
    { name: 'Copywriting', category: 'Bisnis' },
    { name: 'Public Speaking', category: 'Bisnis' },
    { name: 'Project Management', category: 'Bisnis' },
    { name: 'UI/UX Design', category: 'Desain' },
    { name: 'Figma', category: 'Desain' },
    { name: 'Photoshop', category: 'Desain' },
    { name: 'Video Editing', category: 'Desain' },
    { name: 'Bahasa Inggris', category: 'Bahasa' },
    { name: 'Bahasa Jepang', category: 'Bahasa' },
  ];

  console.log('Menyuntikkan data master katalog skill...');

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }

  console.log('Berhasil! Data skill siap digunakan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
