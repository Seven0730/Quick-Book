import { PrismaClient } from '@prisma/client';
import type { Category, Provider, Job } from '@prisma/client';
const prisma = new PrismaClient();

const SG_LAT_MIN = 1.20;
const SG_LAT_MAX = 1.42;
const SG_LON_MIN = 103.60;
const SG_LON_MAX = 104.00;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomIntBetween(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomIntBetween(0, arr.length - 1)];
}

async function main() {
  console.log('Start seeding…');

  const categoryNames = [
    'Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Gardening',
    'Moving', 'Tutoring', 'Pet-sitting', 'Appliance Repair', 'Car Wash'
  ];
  const categories: Category[] = [];
  for (const name of categoryNames) {
    const cat = await prisma.category.create({ data: { name } });
    categories.push(cat);
  }
  console.log('  Created categories:', categories.length);

  const providers:  Provider[] = [];
  for (let i = 1; i <= 30; i++) {
    const prov = await prisma.provider.create({
      data: {
        name:       `Provider ${i}`,
        lat:        parseFloat(randomBetween(SG_LAT_MIN, SG_LAT_MAX).toFixed(6)),
        lon:        parseFloat(randomBetween(SG_LON_MIN, SG_LON_MAX).toFixed(6)),
        rating:     parseFloat(randomBetween(1.0, 5.0).toFixed(1)),
        completed:  randomIntBetween(10, 100),
        available:  Math.random() < 0.9,
      }
    });
    providers.push(prov);
  }
  console.log('  Created providers:', providers.length);

  const timeslotOptions = ['1h','2h','3h','4h'];
  for (let i = 0; i < 100; i++) {
    const category = randomChoice(categories);
    const price = parseFloat(randomBetween(50, 200).toFixed(2));
    const customerLat = parseFloat(randomBetween(SG_LAT_MIN, SG_LAT_MAX).toFixed(6));
    const customerLon = parseFloat(randomBetween(SG_LON_MIN, SG_LON_MAX).toFixed(6));
    const daysAgo = randomIntBetween(0, 180);
    const createdAt = new Date(Date.now() - daysAgo * 24*60*60*1000);

    await prisma.job.create({
      data: {
        categoryId:   category.id,
        price,
        timeslot:     randomChoice(timeslotOptions),
        customerLat,
        customerLon,
        status:       'COMPLETED',
        createdAt,
      }
    });
  }
  console.log('  Created historical jobs: 100');

  console.log('✅ Seeding finished');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
