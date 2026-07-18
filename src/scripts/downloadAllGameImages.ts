import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const prisma = new PrismaClient();

// ============ CONFIGURATION ============
const PUBLIC_DIR = path.join(process.cwd(), 'Public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// ============ STEAM APP IDs FOR ALL 74 GAMES ============
const STEAM_APP_IDS: Record<string, string> = {
  // ORIGINAL 24 GAMES
  'the-witcher-3': '292030',
  'elden-ring': '1245620',
  'god-of-war-2018': '1593500',
  'red-dead-redemption-2': '1174180',
  'cyberpunk-2077': '1091500',
  minecraft: '432350', // Minecraft Story Mode
  'doom-eternal': '782330',
  hades: '1145360',
  'stardew-valley': '413150',
  'portal-2': '620',
  'forza-horizon-5': '1551360',
  'dark-souls-3': '374320',
  inside: '304430',
  'civilization-vi': '289070',
  'xcom-2': '268500',
  'dead-space-remake': '1693980',
  factorio: '427520',
  celeste: '504230',
  control: '870780',
  'hollow-knight': '367520',
  'slay-the-spire': '646570',
  sekiro: '814380',
  'the-sims-4': '1222670',
  'amnesia-the-dark-descent': '57300',

  // 50 NEW GAMES
  'baldurs-gate-3': '1086940',
  'zelda-tears-of-the-kingdom': '', // Nintendo exclusive - no Steam
  'spider-man-2': '', // PlayStation exclusive - no Steam
  'alan-wake-2': '', // Epic exclusive - no Steam
  starfield: '1716740',
  'diablo-4': '', // Battle.net exclusive - no Steam
  'final-fantasy-xvi': '', // PlayStation exclusive
  'street-fighter-6': '1364780',
  'hogwarts-legacy': '990080',
  'resident-evil-4-remake': '2050650',
  'armored-core-6': '1888160',
  'lies-of-p': '1627720',
  'sea-of-stars': '1244090',
  'pikmin-4': '', // Nintendo exclusive
  'remnant-2': '1282100',
  'fire-emblem-engage': '', // Nintendo exclusive
  'hi-fi-rush': '1817230',
  'dead-island-2': '', // Epic exclusive
  'octopath-traveler-2': '1971650',
  'wo-long-fallen-dynasty': '1448440',
  'atlas-fallen': '1274120',
  'immortals-of-aveum': '2009100',
  'payday-3': '1272080',
  'mortal-kombat-1': '1971870',
  'assassins-creed-mirage': '2410010',
  'sonic-superstars': '2028790',
  'ghostrunner-2': '2174980',
  'cities-skylines-2': '949230',
  'star-ocean-the-divine-force': '2230640',
  harvestella: '1816300',
  'tactics-ogre-reborn': '1451090',
  pentiment: '1205520',
  'evil-west': '1319590',
  'midnight-suns': '1225970',
  'chained-echoes': '1229380',
  'high-on-life': '1583230',
  'crisis-core-reunion': '1608070',
  'fifa-23': '1811260',
  'call-of-duty-modern-warfare-2': '1962660',
  'gotham-knights': '1496790',
  'a-plague-tale-requiem': '1182900',
  'persona-5-royal': '1687950',
  scorn: '937970',
  'uncharted-legacy-of-thieves': '1659420',
  'platinum-trip': '', // Custom/unknown
  'overwatch-2': '2357570',
  'f1-22': '1692250',
  'return-to-monkey-island': '2060130',
  'splatoon-3': '', // Nintendo exclusive
  'valkyrie-elysium': '1959220',
  'soul-hackers-2': '1692960',
  'two-point-campus': '1649080',
  'digimon-survive': '1334480',
  'live-a-live': '', // Nintendo exclusive
  stray: '1332010',
  'monster-hunter-rise-sunbreak': '1446780', // DLC
  'cuphead-delicious-last-course': '1847260', // DLC
  'fire-emblem-warriors-three-hopes': '', // Nintendo exclusive
  'ai-the-somnium-files-nirvana-initiative': '1547150',
};

// ============ FALLBACK PLACEHOLDER GENERATOR ============
function getFallbackUrl(slug: string, name: string): string {
  // Use placeholder service with game name
  return `https://placehold.co/460x215/1a202c/ffffff?text=${encodeURIComponent(name)}`;
}

// ============ DOWNLOAD FUNCTION ============
async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', reject);
    });
  } catch (error) {
    return false;
  }
}

// ============ MAIN FUNCTION ============
async function main() {
  console.log('🎮 GAME IMAGE DOWNLOADER');
  console.log('========================\n');

  // Get all games from database
  const games = await prisma.game.findMany({
    select: {
      slug: true,
      name: true,
      backgroundImage: true,
    },
  });

  console.log(`📋 Found ${games.length} games in database\n`);
  console.log('📥 Starting downloads...\n');

  let steamSuccess = 0;
  let placeholderSuccess = 0;
  let skipped = 0;
  let failed = 0;

  for (const game of games) {
    const imagePath = path.join(IMAGES_DIR, `${game.slug}.jpg`);
    const dbImagePath = `/images/${game.slug}.jpg`;

    // Skip if image already exists
    if (fs.existsSync(imagePath)) {
      console.log(`⏭️  ${game.slug} - already exists`);

      // Still ensure database has correct path
      if (game.backgroundImage !== dbImagePath) {
        await prisma.game.update({
          where: { slug: game.slug },
          data: { backgroundImage: dbImagePath },
        });
        console.log(`   📝 Updated database path`);
      }

      skipped++;
      continue;
    }

    console.log(`🔄 ${game.slug} (${game.name})...`);

    let downloaded = false;
    let source = '';

    // TRY 1: Steam CDN
    const appId = STEAM_APP_IDS[game.slug];
    if (appId) {
      const steamUrl = `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`;
      console.log(`   Trying Steam...`);
      downloaded = await downloadImage(steamUrl, imagePath);
      if (downloaded) source = 'Steam';
    }

    // TRY 2: Steam Alternative CDN
    if (!downloaded && appId) {
      const steamAltUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
      console.log(`   Trying Steam Alt...`);
      downloaded = await downloadImage(steamAltUrl, imagePath);
      if (downloaded) source = 'Steam Alt';
    }

    // TRY 3: Placeholder
    if (!downloaded) {
      console.log(`   Using placeholder...`);
      const placeholderUrl = getFallbackUrl(game.slug, game.name);
      downloaded = await downloadImage(placeholderUrl, imagePath);
      if (downloaded) source = 'Placeholder';
    }

    // Update database and count results
    if (downloaded) {
      await prisma.game.update({
        where: { slug: game.slug },
        data: { backgroundImage: dbImagePath },
      });

      if (source === 'Steam' || source === 'Steam Alt') {
        steamSuccess++;
        console.log(`   ✅ Downloaded from ${source}`);
      } else {
        placeholderSuccess++;
        console.log(`   ✅ Generated placeholder`);
      }
    } else {
      failed++;
      console.log(`   ❌ Failed all sources`);

      // Still set placeholder path in DB even if image failed
      await prisma.game.update({
        where: { slug: game.slug },
        data: { backgroundImage: dbImagePath },
      });
    }
  }

  // ============ STATISTICS ============
  console.log('\n' + '='.repeat(40));
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('='.repeat(40));
  console.log(`✅ Steam images downloaded: ${steamSuccess}`);
  console.log(`🖼️  Placeholders generated: ${placeholderSuccess}`);
  console.log(`⏭️  Already existed: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Images saved to: ${IMAGES_DIR}`);
  console.log('='.repeat(40));

  // ============ VERIFY DATABASE ============
  console.log('\n🔍 Verifying database paths...');
  const updatedGames = await prisma.game.findMany({
    select: { slug: true, backgroundImage: true },
  });

  let validPaths = 0;
  for (const game of updatedGames) {
    if (game.backgroundImage?.startsWith('/images/')) {
      validPaths++;
    }
  }
  console.log(
    `✅ ${validPaths}/${updatedGames.length} games have correct image paths`,
  );

  // ============ CHECK FOR MISSING STEAM IDs ============
  console.log('\n⚠️  Games without Steam IDs (will use placeholders):');
  const missingSteamIds = games.filter((g) => !STEAM_APP_IDS[g.slug]);
  for (const game of missingSteamIds.slice(0, 10)) {
    // Show first 10
    console.log(`   • ${game.slug}`);
  }
  if (missingSteamIds.length > 10) {
    console.log(`   ... and ${missingSteamIds.length - 10} more`);
  }

  console.log('\n🎉 Done!');
}

// ============ RUN SCRIPT ============
main()
  .catch((error) => {
    console.error('❌ Script failed:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
