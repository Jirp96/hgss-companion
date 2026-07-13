<script lang="ts">
  import { mapNodes } from '../lib/data';
  import type { MapNode } from '../lib/types';

  // Node ids to emphasise (e.g. a single event's location).
  export let highlight: string[] = [];
  // Ordered stops to draw as a route; sequence badges + connecting lines.
  export let path: MapNode[] = [];
  // Per-segment crossing flags aligned with path[i] -> path[i+1].
  export let crossings: boolean[] = [];

  $: highlightSet = new Set(highlight);
  $: pathSet = new Set(path.map((n) => n.id));
  $: pathIndex = new Map(path.map((n, i) => [n.id, i + 1]));

  function emphasised(id: string): boolean {
    return highlightSet.has(id) || pathSet.has(id);
  }
</script>

<svg viewBox="0 0 1000 520" class="map" role="img" aria-label="Mapa de Johto y Kanto">
  <!-- coastlines / grass -->
  <path
    class="grass"
    d="M40,120 C90,70 200,48 300,58 C382,66 476,86 484,160 C494,232 470,322 452,402
       C432,472 342,502 250,496 C168,491 120,470 100,430 C58,378 28,300 40,220
       C45,180 30,150 40,120 Z"
  />
  <path
    class="grass"
    d="M556,150 C600,98 692,78 782,84 C872,90 952,120 950,202 C948,272 916,332 882,382
       C852,424 800,436 740,440 C690,444 648,432 618,402 C582,366 558,300 556,230
       C555,196 546,176 556,150 Z"
  />
  <!-- small western island (Cianwood) -->
  <path class="grass" d="M44,332 C40,312 60,300 78,306 C96,312 98,340 84,352 C66,366 48,354 44,332 Z" />
  <!-- Cinnabar island -->
  <path class="grass" d="M612,478 C608,462 628,452 646,458 C664,464 666,490 650,500 C632,510 616,498 612,478 Z" />

  <!-- inland (route) tan interiors -->
  <path
    class="inland"
    d="M120,160 C190,128 300,128 372,166 C420,196 424,300 372,356 C316,412 200,410 152,372
       C104,336 96,232 120,160 Z"
  />
  <path
    class="inland"
    d="M600,168 C650,132 740,124 812,158 C876,188 882,286 838,344 C800,392 720,398 660,378
       C612,362 586,262 600,168 Z"
  />

  <!-- southern bay inlet (Kanto) -->
  <path class="bay" d="M676,436 C704,404 762,412 786,446 C800,474 760,496 712,488 C678,482 664,458 676,436 Z" />

  <!-- route lines -->
  {#each path.slice(0, -1) as node, i}
    {@const b = path[i + 1]}
    <line class="leg" class:cross={crossings[i]} x1={node.x} y1={node.y} x2={b.x} y2={b.y} />
  {/each}

  <!-- nodes: squares = fly points (towns), circles = other venues -->
  {#each mapNodes as n}
    {@const on = emphasised(n.id)}
    <g class="node" class:on>
      {#if n.flyPoint}
        {@const s = on ? 16 : 9}
        <rect x={n.x - s / 2} y={n.y - s / 2} width={s} height={s} rx="2" />
      {:else}
        <circle cx={n.x} cy={n.y} r={on ? 8 : 4} />
      {/if}
      {#if pathIndex.has(n.id)}
        <text class="seq" x={n.x} y={n.y + 3.6}>{pathIndex.get(n.id)}</text>
      {/if}
    </g>
  {/each}
</svg>

<style>
  .map {
    width: 100%;
    height: auto;
    display: block;
    background: var(--map-sea);
    border: 2px solid var(--border-strong);
    border-radius: var(--radius);
  }
  .grass {
    fill: var(--map-grass);
    stroke: var(--map-coast);
    stroke-width: 2.5;
  }
  .inland {
    fill: var(--map-inland);
    stroke: none;
  }
  .bay {
    fill: var(--map-sea);
    stroke: none;
  }
  .node rect,
  .node circle {
    fill: var(--map-marker);
    stroke: var(--map-coast);
    stroke-width: 1;
  }
  .node.on rect,
  .node.on circle {
    fill: var(--accent);
    stroke: var(--surface);
    stroke-width: 1.5;
  }
  .seq {
    fill: var(--accent-contrast);
    font-size: 10px;
    font-weight: 700;
    text-anchor: middle;
  }
  .leg {
    stroke: var(--accent);
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0.9;
  }
  .leg.cross {
    stroke: var(--both);
    stroke-width: 3.5;
    stroke-dasharray: 8 6;
  }
</style>
