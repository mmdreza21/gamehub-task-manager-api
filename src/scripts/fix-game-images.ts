import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, slug: true },
  });

  console.log(`Found ${games.length} games`);

  for (const game of games) {
    const imagePath = `/images/${game.slug}.jpg`;

    await prisma.game.update({
      where: { id: game.id },
      data: { backgroundImage: imagePath },
    });

    console.log(`✔ Updated ${game.slug} → ${imagePath}`);
  }

  console.log('🎉 All games updated successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
