<script lang="ts">
  import type { GameEvent } from '../lib/types';
  import { done, version, reminders } from '../lib/stores';
  import { DAY_LABELS } from '../lib/dateUtils';
  import RegionBadge from './RegionBadge.svelte';

  export let event: GameEvent;
  export let sourceUrl: string;

  let showReminder = false;
  let reminderTime = event.time?.start ?? '08:00';

  $: isDone = $done.ids.includes(event.id);
  $: versionNote = event.versionNotes?.[$version];

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
    <RegionBadge region={event.region} />
  </div>

  <p class="meta muted">
    📍 {event.location} · 🗓 {daysLabel(event)} · 🕑 {timeLabel(event)}
  </p>

  {#if event.notes}<p class="notes">{event.notes}</p>{/if}
  {#if versionNote}
    <p class="vnote"><strong>{$version}:</strong> {versionNote}</p>
  {/if}

  <div class="row actions">
    <button class="pill-btn" class:active={isDone} on:click={() => done.toggle(event.id)}>
      {isDone ? '✓ Hecho' : 'Marcar hecho'}
    </button>
    <button class="pill-btn" on:click={() => (showReminder = !showReminder)}>⏰ Recordar</button>
    <a class="src" href={sourceUrl} target="_blank" rel="noopener noreferrer">fuente</a>
  </div>

  {#if showReminder}
    <div class="row reminder">
      <label>Hora: <input type="time" bind:value={reminderTime} /></label>
      <button class="pill-btn active" on:click={addReminder}>Guardar</button>
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
    font-size: 1.02rem;
  }
  .meta {
    margin: 0.35rem 0;
  }
  .notes {
    margin: 0.35rem 0;
    font-size: 0.92rem;
  }
  .vnote {
    margin: 0.35rem 0;
    font-size: 0.9rem;
    padding: 0.35rem 0.55rem;
    background: var(--surface-2);
    border-radius: 8px;
  }
  .actions {
    margin-top: 0.5rem;
  }
  .src {
    font-size: 0.8rem;
    color: var(--text-dim);
  }
  .reminder {
    margin-top: 0.5rem;
  }
  .card.done {
    opacity: 0.6;
  }
  .card.done h3 {
    text-decoration: line-through;
  }
  input[type='time'] {
    font: inherit;
    padding: 0.2rem 0.4rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }
</style>
