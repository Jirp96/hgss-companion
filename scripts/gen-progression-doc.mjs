// Genera PROGRESION.md a partir de src/lib/data/progression.json.
// La app y el documento salen de la misma fuente, así no se desincronizan.
//   node scripts/gen-progression-doc.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'src/lib/data/progression.json'), 'utf8'));

const KIND_LABEL = {
  story: 'Historia',
  gym: 'Gimnasio',
  rocket: 'Team Rocket',
  rival: 'Rival',
  league: 'Liga',
  legendary: 'Legendario',
  unlock: 'Desbloqueo',
};

const steps = data.chapters.flatMap((c) => c.steps);
const badges = steps.filter((s) => s.badge);
const out = [];

out.push('# Guía de progresión — Pokémon HeartGold / SoulSilver');
out.push('');
out.push('> Archivo generado por `npm run docs:progresion` desde `src/lib/data/progression.json`.');
out.push('> No lo edites a mano: editá el JSON y volvé a generarlo.');
out.push('> La misma guía, con casillas para ir marcando, está en la pestaña **Progresión** de la app.');
out.push('');
out.push(
  `**${steps.length} pasos** · ${steps.filter((s) => !s.optional).length} obligatorios · ` +
    `${badges.length} medallas · fuente: ${data.source}.`
);
out.push('');

// Mapa general.
out.push('## Vista general');
out.push('');
out.push('```');
for (const ch of data.chapters) {
  out.push(`${ch.title}  (${ch.steps.length} pasos)`);
  for (const s of ch.steps) {
    const mark = s.badge ? `[${s.badge.region[0]}${s.badge.order}]` : s.optional ? ' ~ ' : ' | ';
    out.push(`  ${mark} ${s.name}`);
  }
  out.push('');
}
out.push('```');
out.push('');

// Tabla de medallas.
out.push('## Las 16 medallas');
out.push('');
out.push('| # | Medalla | Líder | Tipo | Ciudad | Nivel más alto |');
out.push('|---|---|---|---|---|---|');
badges.forEach((s, i) => {
  const b = s.badge;
  out.push(`| ${i + 1} | ${b.es} (${b.en}) | ${b.leader} | ${b.type} | ${s.location} | ${s.level} |`);
});
out.push('');

// Capítulos en detalle.
for (const ch of data.chapters) {
  out.push(`## ${ch.title}`);
  out.push('');
  out.push(`_${ch.subtitle}_`);
  out.push('');
  if (ch.links?.length) {
    out.push(`Serebii: ${ch.links.map((l) => `[${l.label}](${l.url})`).join(' · ')}`);
    out.push('');
  }
  for (const s of ch.steps) {
    out.push(`### ${s.name}${s.optional ? ' *(opcional)*' : ''}`);
    out.push('');
    const meta = [KIND_LABEL[s.kind], s.location];
    if (s.level !== '—') meta.push(s.level);
    out.push(`**${meta.join(' · ')}**`);
    out.push('');
    out.push(s.detail);
    out.push('');
    if (s.badge) {
      out.push(`- 🏅 **${s.badge.es}** (${s.badge.en}) — ${s.badge.leader}, tipo ${s.badge.type}`);
    }
    if (s.items?.length) out.push(`- 🎁 Obtenés: ${s.items.join(' · ')}`);
    if (s.unlocks?.length) out.push(`- 🔓 Desbloquea: ${s.unlocks.join(' · ')}`);
    if (s.versionNotes) {
      for (const [v, note] of Object.entries(s.versionNotes)) out.push(`- **${v}:** ${note}`);
    }
    if (s.links?.length) {
      out.push(`- 🔗 Serebii: ${s.links.map((l) => `[${l.label}](${l.url})`).join(' · ')}`);
    }
    out.push('');
  }
}

writeFileSync(join(root, 'PROGRESION.md'), out.join('\n'), 'utf8');
console.log(`PROGRESION.md generado (${steps.length} pasos).`);
