<script lang="ts">
  import { allEvents, eventsSource } from '../lib/data';
  import { version, now } from '../lib/stores';
  import { DAYS, DAY_LABELS, occursOnDay, availableInVersion, todayDay } from '../lib/dateUtils';
  import type { Day } from '../lib/types';
  import EventCard from './EventCard.svelte';
  import SourceAttribution from './SourceAttribution.svelte';

  $: today = todayDay($now);
  // Default to today, but allow every panel to be closed (null).
  let openDay: Day | null = todayDay();

  $: forVersion = allEvents.filter((e) => availableInVersion(e, $version));
  function eventsFor(day: Day) {
    return forVersion.filter((e) => occursOnDay(e, day));
  }
</script>

<h2>Semana</h2>
<p class="muted">Elegí un día para ver sus eventos.</p>

{#each DAYS as day}
  {@const list = eventsFor(day)}
  <div class="day">
    <button
      class="day-head"
      class:today={day === today}
      class:open={openDay === day}
      on:click={() => (openDay = openDay === day ? null : day)}
    >
      <span>{DAY_LABELS[day]}{#if day === today} · hoy{/if}</span>
      <span class="count muted">{list.length} eventos {openDay === day ? '▲' : '▼'}</span>
    </button>
    {#if openDay === day}
      <div class="day-body">
        {#each list as event (event.id)}
          <EventCard {event} />
        {/each}
      </div>
    {/if}
  </div>
{/each}

<SourceAttribution url={eventsSource} label="Eventos diarios" />

<style>
  .day {
    margin-bottom: 0.5rem;
  }
  .day-head {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.7rem 0.9rem;
    color: var(--text);
    font-weight: 600;
  }
  .day-head.today {
    border-color: var(--accent);
  }
  .day-head.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .count {
    font-weight: 400;
    font-size: 0.85rem;
  }
  .day-body {
    padding: 0.75rem 0.5rem 0.25rem;
    border: 1px solid var(--border);
    border-top: none;
    border-radius: 0 0 var(--radius) var(--radius);
  }
</style>
