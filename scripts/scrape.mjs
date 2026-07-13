// Scraper for HGSS Companion trainer-rematch data.
//
// Source of ALL data is Serebii (https://www.serebii.net/heartgoldsoulsilver).
// HGSS is a frozen 2009/2010 game, so this is run manually (`npm run scrape`) and
// the resulting JSON is committed. No runtime/live scraping happens in the app.
//
// Only the trainer-rematch pages are scraped here: they hold dozens of trainers
// across 7 day-pages and are error-prone to transcribe by hand. The small fixed
// sets (events, gym rematches, map graph) are hand-curated static files in
// src/lib/data/, each carrying a `sourceUrl` back to Serebii.
import * as cheerio from 'cheerio';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { get } from './lib/fetch.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'lib', 'data');
const BASE = 'https://www.serebii.net/heartgoldsoulsilver';

const DAYS = [
  ['Mon', 'monday'],
  ['Tue', 'tuesday'],
  ['Wed', 'wednesday'],
  ['Thu', 'thursday'],
  ['Fri', 'friday'],
  ['Sat', 'saturday'],
  ['Sun', 'sunday'],
];

/** "Johto - National Park" -> { region, place } */
function parseLocation(raw) {
  const idx = raw.indexOf(' - ');
  if (idx === -1) return { region: 'Johto', place: raw.trim() };
  return { region: raw.slice(0, idx).trim(), place: raw.slice(idx + 3).trim() };
}

/** "Morning4am-10am" -> { period: "Morning", hours: "4am-10am" } */
function parseTime(raw) {
  const m = raw.match(/^(Morning|Day|Night)(.*)$/i);
  if (!m) return { period: 'Any', hours: raw.trim() };
  return { period: m[1], hours: m[2].trim() };
}

/** Parse the strongest (last) battle sub-table into [{ name, level }]. */
function parseFinalTeam($, teamsCell) {
  const battle = teamsCell.find('table').last();
  const rows = battle.children('tbody').children('tr');
  let names = [];
  let levels = [];
  rows.each((_, r) => {
    const cells = $(r).children('td');
    const texts = cells.map((__, c) => $(c).text().trim()).get();
    if (texts.some((t) => /^Level\s+\d+/i.test(t))) {
      levels = texts
        .map((t) => (t.match(/Level\s+(\d+)/i) || [])[1])
        .filter(Boolean)
        .map(Number);
    } else if (texts.length > 1 && !/Battle/i.test(texts[0])) {
      // First cell is the trainer name; remaining cells are Pokémon.
      names = texts.slice(1).filter((t) => t.length > 0);
    }
  });
  return names.map((name, i) => ({ name, level: levels[i] ?? null }));
}

async function scrapeDay(dayCode, slug) {
  const url = `${BASE}/rematch-${slug}.shtml`;
  const html = await get(url);
  const $ = cheerio.load(html);
  const rows = $('table').first().children('tbody').children('tr').toArray();

  const entries = [];
  for (let i = 0; i < rows.length; i++) {
    const cells = $(rows[i]).children('td');
    if (cells.length !== 3) continue;
    const [c0, c1, c2] = cells.map((_, c) => $(c).text().trim().replace(/\s+/g, ' ')).get();
    if (/^Time$/i.test(c0)) continue; // header row

    const { region, place } = parseLocation(c1);
    const { period, hours } = parseTime(c0);

    // The following row (1 cell) holds the Teams block.
    let team = [];
    const next = $(rows[i + 1]);
    if (next.children('td').length === 1) {
      team = parseFinalTeam($, next.children('td').first());
      i++;
    }
    entries.push({ trainer: c2, region, place, period, hours, team });
  }
  return { url, entries };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Merge trainers across days, keyed by trainer + location.
  const byKey = new Map();
  const sources = [];
  for (const [dayCode, slug] of DAYS) {
    const { url, entries } = await scrapeDay(dayCode, slug);
    sources.push(url);
    for (const e of entries) {
      const key = `${e.trainer}|${e.place}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          id: key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          trainer: e.trainer,
          region: e.region,
          location: e.place,
          callDays: [],
          period: e.period,
          hours: e.hours,
          team: e.team,
        });
      }
      const rec = byKey.get(key);
      if (!rec.callDays.includes(dayCode)) rec.callDays.push(dayCode);
    }
    console.error(`  ${slug}: ${entries.length} trainers`);
  }

  const trainers = [...byKey.values()].sort((a, b) => a.trainer.localeCompare(b.trainer));
  const out = {
    source: 'Serebii.net',
    sourceUrl: `${BASE}/rematch.shtml`,
    daySourceUrls: sources,
    scrapedAt: new Date().toISOString().slice(0, 10),
    note: 'Los números de Pokégear se obtienen registrando a cada entrenador; ver Serebii.',
    trainers,
  };
  await writeFile(join(OUT_DIR, 'trainer-rematches.json'), JSON.stringify(out, null, 2) + '\n');
  console.error(`Wrote ${trainers.length} unique trainers to trainer-rematches.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
