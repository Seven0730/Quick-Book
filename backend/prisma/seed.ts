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

    for (let i = 1; i <= 30; i++) {
        await prisma.provider.createMany({
            data: Array.from({ length: 30 }, (_, i) => ({
                name: `Provider ${i + 1}`,
                rating: Math.round((3 + Math.random() * 2) * 10) / 10,
                completed: Math.floor(Math.random() * 100),
                lat: 1.30 + Math.random() * 0.10,
                lon: 103.8 + Math.random() * 0.10,
                available: Math.random() < 0.8,
            })),
            skipDuplicates: true,
        });
    }

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
