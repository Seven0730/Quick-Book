import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Categories
  const categories = ['Air Conditioning Repair', 'Home Cleaning', 'Drain Cleaning', 'Housekeeping'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed Jobs (sample orders)
  await prisma.job.create({
    data: {
      categoryId: 1, // Air Conditioning Repair
      price: 100,
      timeslot: '2h',
    },
  });
  await prisma.job.create({
    data: {
      categoryId: 2, // Home Cleaning
      price: 150,
      timeslot: '3h',
    },
  });

  console.log('Seed data has been created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
