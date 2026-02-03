import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const games = await prisma.game.findMany({
    select: { id: true, slug: true, name: true, platform: true },
  });

  for (const game of games) {
    await prisma.game.update({
      where: { id: game.id },
      data: { platform: { set: ['Windows', 'Playstation'] } },
    });

    console.log(`✔ Updated ${game.name} ;; ${game.platform}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
