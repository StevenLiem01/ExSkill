const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBudi() {
  console.log("Mencari Budi...");
  const budi = await prisma.user.findUnique({ where: { email: 'budi@dummy.com' } });
  
  if (!budi) {
    console.log("Budi tidak ditemukan!");
    return;
  }

  // Hapus skill lama Budi
  await prisma.userSkill.deleteMany({ where: { user_id: budi.id } });
  await prisma.wantedSkill.deleteMany({ where: { user_id: budi.id } });

  // Cari Machine Learning dan Arduino
  const ml = await prisma.skill.findFirst({ where: { name: { contains: 'Machine Learning' } } });
  const arduino = await prisma.skill.findFirst({ where: { name: { contains: 'Arduino' } } });

  if (!ml || !arduino) {
    console.log("Skill ML atau Arduino tidak ditemukan!");
    return;
  }

  // Budi MENAWARKAN Arduino (Karena User MENCARI Arduino)
  await prisma.userSkill.create({
    data: {
      user_id: budi.id,
      skill_id: arduino.id,
      proficiency: 'INTERMEDIATE'
    }
  });

  // Budi MENCARI Machine Learning (Karena User MENAWARKAN Machine Learning)
  await prisma.wantedSkill.create({
    data: {
      user_id: budi.id,
      skill_id: ml.id
    }
  });

  console.log("Selesai! Budi sekarang menawarkan Arduino dan mencari Machine Learning.");
}

fixBudi()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
