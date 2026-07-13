<script lang="ts">
  import type { GameEvent } from '../lib/types';
  import { done, permanentDone, version, reminders } from '../lib/stores';
  import { DAY_LABELS } from '../lib/dateUtils';
  import RegionBadge from './RegionBadge.svelte';
  import RegionMap from './RegionMap.svelte';

  export let event: GameEvent;

  let showReminder = false;
  let showMap = false;
  let reminderTime = event.time?.start ?? '08:00';

  $: isDone = event.persistent ? $permanentDone.includes(event.id) : $done.ids.includes(event.id);
  $: versionNote = event.versionNotes?.[$version];

  function toggleDone() {
    if (event.persistent) permanentDone.toggle(event.id);
    else done.toggle(event.id);
  }

  function daysLabel(e: GameEvent): string {
    if (e.days === 'daily') return 'Todos los días';
    return e.days.map((d) => DAY_LABELS[d]).join(', ');
  }

  function timeLabel(e: GameEvent): string {
    return e.time ? `${e.time.start}–${e.time.end}` : 'Cualquier hora';
  }

  function addReminder() {
    reminders.update((list) => [
      ...list,
      {
        id: `${event.id}-${Date.now()}`,
        eventId: event.id,
        label: event.name,
        time: reminderTime,
        createdAt: Date.now(),
      },
    ]);
    showReminder = false;
  }
</script>

<article class="card" class:done={isDone}>
  <div class="head">
    <h3>{event.name}</h3>
    <div class="tags">
      {#if event.persistent}<span class="badge badge-perm">una vez</span>{/if}
      <RegionBadge region={event.region} />
    </div>
  </div>

  <p class="meta muted">
    📍 {event.location} · 🗓 {daysLabel(event)} · 🕑 {timeLabel(event)}
  </p>

  {#if event.notes}<p class="notes">{event.notes}</p>{/if}
  {#if versionNote}
    <p class="vnote"><strong>{$version}:</strong> {versionNote}</p>
  {/if}

  <div class="row actions">
    <button class="pill-btn" class:active={isDone} on:click={toggleDone}>
      {isDone ? '✓ Hecho' : 'Marcar hecho'}
    </button>
    <button class="pill-btn" on:click={() => (showReminder = !showReminder)}>⏰ Recordar</button>
    {#if event.mapNode}
      <button class="pill-btn" class:active={showMap} on:click={() => (showMap = !showMap)}>
        🗺 Mapa
      </button>
    {/if}
  </div>

  {#if showReminder}
    <div class="row reminder">
      <label>Hora: <input type="time" bind:value={reminderTime} /></label>
      <button class="pill-btn active" on:click={addReminder}>Guardar</button>
    </div>
  {/if}

  {#if showMap && event.mapNode}
    <div class="map-wrap">
      <RegionMap highlight={[event.mapNode]} />
    </div>
  {/if}
</article>

<style>
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .head h3 {
    margin: 0;
    font-size: 0.98rem;
  }
  .tags {
    display: flex;
    gap: 0.3rem;
    align-items: center;
    flex-shrink: 0;
  }
  .badge-perm {
    color: var(--accent-dark);
    background: var(--surface-2);
  }
  .meta {
    margin: 0.35rem 0;
  }
  .notes {
    margin: 0.35rem 0;
    font-size: 0.9rem;
  }
  .vnote {
    margin: 0.35rem 0;
    font-size: 0.88rem;
    padding: 0.35rem 0.55rem;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .actions {
    margin-top: 0.5rem;
  }
  .reminder {
    margin-top: 0.5rem;
  }
  .map-wrap {
    margin-top: 0.6rem;
  }
  .card.done {
    opacity: 0.62;
  }
  .card.done h3 {
    text-decoration: line-through;
  }
</style>
