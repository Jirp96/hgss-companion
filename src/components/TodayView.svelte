<script lang="ts">
  import { allEvents, eventsSource } from '../lib/data';
  import { version, now, done, permanentDone } from '../lib/stores';
  import { todayDay, occursOnDay, availableInVersion, DAY_LABELS } from '../lib/dateUtils';
  import type { GameEvent } from '../lib/types';
  import EventCard from './EventCard.svelte';
  import RemindersPanel from './RemindersPanel.svelte';
  import SourceAttribution from './SourceAttribution.svelte';

  $: today = todayDay($now);
  $: todays = allEvents.filter((e) => availableInVersion(e, $version) && occursOnDay(e, today));
  $: isDone = (e: GameEvent) =>
    e.persistent ? $permanentDone.includes(e.id) : $done.ids.includes(e.id);
  $: johtoCount = todays.filter((e) => e.region === 'Johto').length;
  $: kantoCount = todays.filter((e) => e.region === 'Kanto').length;
  $: pending = todays.filter((e) => !isDone(e)).length;
</script>

<h2>Hoy — {DAY_LABELS[today]}</h2>
<p class="muted summary">
  <span>{todays.length} eventos</span>
  <span>·</span>
  <span>{pending} pendientes</span>
  <span class="badge badge-johto">{johtoCount} Johto</span>
  <span class="badge badge-kanto">{kantoCount} Kanto</span>
</p>

{#each todays as event (event.id)}
  <EventCard {event} />
{/each}

<RemindersPanel />
<SourceAttribution url={eventsSource} label="Eventos diarios" />

<style>
  .summary {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 0.7rem;
    margin-bottom: 0.9rem;
  }
</style>
