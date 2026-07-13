<script lang="ts">
  import { allEvents, eventsSource, mapNodes } from '../lib/data';
  import { version, now, done, permanentDone } from '../lib/stores';
  import {
    DAYS,
    DAY_LABELS,
    occursOnDay,
    availableInVersion,
    todayDay,
  } from '../lib/dateUtils';
  import { planRoute } from '../lib/route';
  import type { Day, GameEvent } from '../lib/types';
  import RegionBadge from './RegionBadge.svelte';
  import RegionMap from './RegionMap.svelte';
  import SourceAttribution from './SourceAttribution.svelte';

  $: today = todayDay($now);
  let day: Day | null = null;
  $: if (day === null) day = today;

  let excludeDone = true;
  let startNode = '';

  const flyPoints = mapNodes.filter((n) => n.flyPoint);
  const nodeName = new Map(mapNodes.map((n) => [n.id, n.name]));

  $: isDone = (e: GameEvent) =>
    e.persistent ? $permanentDone.includes(e.id) : $done.ids.includes(e.id);

  // Events active on the chosen day, filtered by version and (optionally) done.
  $: active = allEvents.filter(
    (e) =>
      availableInVersion(e, $version) &&
      occursOnDay(e, day!) &&
      (!excludeDone || !isDone(e))
  );

  // Events that can be routed (have a map node) vs. those that can't.
  $: routable = active.filter((e) => e.mapNode);
  $: unroutable = active.filter((e) => !e.mapNode);

  // Group event names by node for display.
  $: eventsByNode = routable.reduce((m, e) => {
    const arr = m.get(e.mapNode!) ?? [];
    arr.push(e.name);
    m.set(e.mapNode!, arr);
    return m;
  }, new Map<string, string[]>());

  $: result = planRoute(
    routable.map((e) => e.mapNode),
    day,
    startNode || null
  );
</script>

<h2>Ruta del día</h2>
<p class="muted">
  Ordena los eventos de hoy minimizando los cruces entre Johto y Kanto (y luego los vuelos).
</p>

<div class="controls card">
  <label>
    Día:
    <select bind:value={day}>
      {#each DAYS as d}<option value={d}>{DAY_LABELS[d]}{d === today ? ' · hoy' : ''}</option>{/each}
    </select>
  </label>
  <label>
    Empezar en:
    <select bind:value={startNode}>
      <option value="">Automático</option>
      {#each flyPoints as n}<option value={n.id}>{n.name}</option>{/each}
    </select>
  </label>
  <label class="check">
    <input type="checkbox" bind:checked={excludeDone} /> Excluir eventos hechos
  </label>
</div>

{#if result.order.length === 0}
  <p class="muted">No hay eventos con ubicación fija para este día.</p>
{:else}
  <p class="summary">
    <strong>{result.order.length}</strong> paradas ·
    <strong>{result.jumps}</strong> vuelos/saltos ·
    <strong>{result.crossings}</strong> cruce(s) de región
  </p>

  <div class="map-wrap">
    <RegionMap path={result.order} crossings={result.legs.map((l) => l.crossesRegion)} />
    <p class="legend muted">
      Los números marcan el orden. Las líneas punteadas moradas son cruces entre regiones.
    </p>
  </div>

  <ol class="stops">
    {#each result.order as node, i (node.id)}
      <li>
        <div class="stop">
          <span class="num">{i + 1}</span>
          <div>
            <div class="row name">
              <strong>{node.name}</strong>
              <RegionBadge region={node.region} />
            </div>
            <div class="muted evs">{(eventsByNode.get(node.id) ?? []).join(' · ')}</div>
          </div>
        </div>
        {#if result.legs[i]?.crossesRegion}
          <div class="cross">↕ cruce de región hacia {result.legs[i].to.name}</div>
        {/if}
      </li>
    {/each}
  </ol>
{/if}

{#if unroutable.length}
  <div class="card">
    <h3>Sin ubicación fija</h3>
    <p class="muted">Estos eventos de hoy no entran en la ruta (varían de lugar o son de radio):</p>
    <ul>
      {#each unroutable as e (e.id)}<li>{e.name}</li>{/each}
    </ul>
  </div>
{/if}

<SourceAttribution url={eventsSource} label="Eventos diarios" />

<style>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    align-items: center;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  label {
    font-size: 0.9rem;
  }
  select {
    font: inherit;
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }
  .summary {
    margin: 1rem 0 0.5rem;
  }
  .map-wrap {
    margin: 0.5rem 0 1rem;
  }
  .legend {
    margin: 0.4rem 0 0;
    font-size: 0.8rem;
  }
  .stops {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .stop {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.65rem 0.8rem;
  }
  .num {
    flex: none;
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 50%;
    background: var(--accent);
    color: var(--accent-contrast);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.85rem;
  }
  .name {
    gap: 0.4rem;
  }
  .evs {
    font-size: 0.85rem;
  }
  .cross {
    color: var(--both);
    font-size: 0.82rem;
    font-weight: 600;
    margin: 0.25rem 0 0.5rem 2.4rem;
  }
</style>
