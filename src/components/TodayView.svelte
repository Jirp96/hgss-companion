<script lang="ts">
  import { events, eventsSource } from '../lib/data';
  import { version, now, done } from '../lib/stores';
  import { todayDay, occursOnDay, availableInVersion, DAY_LABELS } from '../lib/dateUtils';
  import EventCard from './EventCard.svelte';
  import RemindersPanel from './RemindersPanel.svelte';
  import SourceAttribution from './SourceAttribution.svelte';

  $: today = todayDay($now);
  $: todays = events.filter((e) => availableInVersion(e, $version) && occursOnDay(e, today));
  $: johtoCount = todays.filter((e) => e.region === 'Johto').length;
  $: kantoCount = todays.filter((e) => e.region === 'Kanto').length;
  $: pending = todays.filter((e) => !$done.ids.includes(e.id)).length;
</script>

<h2>Hoy — {DAY_LABELS[today]}</h2>
<p class="muted summary">
  {todays.length} eventos · {pending} pendientes ·
  <span class="badge badge-johto">{johtoCount} Johto</span>
  <span class="badge badge-kanto">{kantoCount} Kanto</span>
</p>

{#each todays as event (event.id)}
  <EventCard {event} sourceUrl={eventsSource} />
{/each}

<RemindersPanel />
<SourceAttribution url={eventsSource} label="Eventos diarios" />

<style>
  .summary {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    flex-wrap: wrap;
    margin-top: -0.3rem;
  }
</style>
