# HGSS Companion

Companion web para **Pokémon HeartGold / SoulSilver**: eventos diarios y semanales,
revanchas (rematches) de líderes y entrenadores, y una ruta diaria que minimiza los
cruces entre Johto y Kanto. App estática, pensada para **GitHub Pages**.

> Todos los datos provienen de **[Serebii.net](https://www.serebii.net/heartgoldsoulsilver)**.
> Proyecto de fans, sin afiliación con Nintendo / Game Freak.

## Funcionalidades

- **Versión** HeartGold / SoulSilver (cambia notas específicas y el acento visual).
- **Hoy / Semana / Día**: eventos filtrados por día y versión.
- **Marcar como hecho** (checklist con reset diario) — `localStorage`.
- **Recordatorios** con notificaciones del navegador (solo con la pestaña abierta).
- **Rematches**: 16 líderes + 43 entrenadores, con filtros por región y día de llamada, y equipos.
- **Ruta**: ordena los eventos del día minimizando cruces de región (grafo + TSP).

## Arquitectura

GitHub Pages es estático y Serebii no tiene API (y CORS bloquea el `fetch` en runtime),
así que los datos se **scrapean una vez en build-time a JSON** commiteado. Como HGSS es
un juego congelado, esos JSON son prácticamente permanentes.

```
serebii  ──(npm run scrape)──▶  src/lib/data/*.json  ──▶  app Svelte  ──▶  GitHub Pages
```

### Datos (`src/lib/data/`)

| Archivo | Origen | Cómo se genera |
|---|---|---|
| `trainer-rematches.json` | `rematch-<día>.shtml` (×7) | **Scrapeado** por `scripts/scrape.mjs` |
| `events.json` | `dailyevent.shtml` | Curado a mano (set fijo y chico) |
| `gym-rematches.json` | `gym-rematch.shtml` | Curado a mano |
| `map.json` | — | Curado a mano (la topología no está tabulada en Serebii) |

Cada JSON incluye `sourceUrl` para la atribución en la UI.

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción a dist/
npm test          # tests del pathfinding (Vitest)
npm run scrape    # regenera trainer-rematches.json desde Serebii
```

> **Node 16**: el proyecto usa Vite 4 / Svelte 4 y un pequeño polyfill
> (`scripts/crypto-polyfill.cjs`) porque Node < 16.17 no expone `crypto.getRandomValues`
> en el módulo `node:crypto`. En Node 18+ el polyfill es inofensivo.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` compila y publica `dist/` en cada push a `main`.
El `base` de Vite se deriva del nombre del repo (`BASE_PATH`). En **Settings → Pages**
elegí **GitHub Actions** como source.

## Notas / pendientes

- `trade.shtml` (in-game trades) no está incluido aún; se puede agregar como sección extra.
- Los números de Pokégear de los entrenadores se obtienen registrándolos en el juego;
  la app indica el día/horario de llamada (ver Serebii para cómo conseguir cada número).
