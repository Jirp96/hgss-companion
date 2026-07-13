<script lang="ts">
  import { mapNodes } from '../lib/data';
  import type { MapNode } from '../lib/types';

  // Node ids to emphasise (e.g. a single event's location).
  export let highlight: string[] = [];
  // Ordered stops to draw as a route; sequence badges + connecting lines.
  export let path: MapNode[] = [];
  // Per-segment crossing flags aligned with path[i] -> path[i+1].
  export let crossings: boolean[] = [];

  // Background is the game map served from public/ (base-path aware).
  const mapImg = import.meta.env.BASE_URL + 'region-map.png';

  $: highlightSet = new Set(highlight);
  $: pathSet = new Set(path.map((n) => n.id));
  $: pathIndex = new Map(path.map((n, i) => [n.id, i + 1]));
  // Only the app's own markers for emphasised nodes are drawn over the image.
  $: marked = mapNodes.filter((n) => highlightSet.has(n.id) || pathSet.has(n.id));

  const emph = (id: string) => highlightSet.has(id) || pathSet.has(id);
  // Label placement: below the node if it sits near the top edge, else above;
  // anchor shifts near the left/right edges so text stays inside the map.
  const labelY = (n: MapNode) => (n.y < 28 ? n.y + 20 : n.y - 13);
  const anchor = (n: MapNode) => (n.x < 70 ? 'start' : n.x > 890 ? 'end' : 'middle');
</script>

<svg viewBox="0 0 960 424" class="map" role="img" aria-label="Mapa de Johto y Kanto">
  <image href={mapImg} x="0" y="0" width="960" height="424" preserveAspectRatio="xMidYMid meet" />

  <!-- route lines -->
  {#each path.slice(0, -1) as node, i}
    {@const b = path[i + 1]}
    <line class="leg" class:cross={crossings[i]} x1={node.x} y1={node.y} x2={b.x} y2={b.y} />
  {/each}

  <!-- app markers over the corresponding towns -->
  {#each marked as n (n.id)}
    <g class="marker">
      {#if n.flyPoint}
        <rect x={n.x - 9} y={n.y - 9} width="18" height="18" rx="3" />
      {:else}
        <circle cx={n.x} cy={n.y} r="9.5" />
      {/if}
      {#if pathIndex.has(n.id)}
        <text class="seq" x={n.x} y={n.y + 4}>{pathIndex.get(n.id)}</text>
      {/if}
    </g>
  {/each}

  <!-- town name labels on every node -->
  {#each mapNodes as n (n.id)}
    <text
      class="label"
      class:on={emph(n.id)}
      x={n.x}
      y={labelY(n)}
      text-anchor={anchor(n)}
    >
      {n.name}
    </text>
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
  .marker rect,
  .marker circle {
    fill: var(--accent);
    stroke: #fff;
    stroke-width: 2.5;
    paint-order: stroke;
  }
  .seq {
    fill: var(--accent-contrast);
    font-size: 12px;
    font-weight: 700;
    text-anchor: middle;
  }
  .leg {
    stroke: var(--accent);
    stroke-width: 3.5;
    stroke-linecap: round;
    opacity: 0.95;
  }
  .leg.cross {
    stroke: var(--both);
    stroke-width: 4;
    stroke-dasharray: 9 6;
  }
  /* Labels sit over a fixed-colour image, so their colours are hard-coded
     (independent of the app light/dark theme) for legibility. */
  .label {
    font-size: 10px;
    font-weight: 600;
    fill: #14181f;
    stroke: #ffffff;
    stroke-width: 2.4px;
    paint-order: stroke;
    pointer-events: none;
  }
  .label.on {
    font-size: 11.5px;
    font-weight: 800;
    fill: #7a1020;
  }
</style>
