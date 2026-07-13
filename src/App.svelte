<script lang="ts">
  import { onMount } from 'svelte';
  import { version } from './lib/stores';
  import { startReminderWatcher } from './lib/notify';
  import VersionPicker from './components/VersionPicker.svelte';
  import TodayView from './components/TodayView.svelte';
  import WeekView from './components/WeekView.svelte';
  import RematchesView from './components/RematchesView.svelte';
  import RouteView from './components/RouteView.svelte';

  type Tab = 'today' | 'week' | 'rematches' | 'route';
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'today', label: 'Hoy', icon: '📅' },
    { id: 'week', label: 'Semana', icon: '🗓' },
    { id: 'rematches', label: 'Rematches', icon: '📞' },
    { id: 'route', label: 'Ruta', icon: '🧭' },
  ];
  let active: Tab = 'today';

  // Reflect version on <html> so the accent colour theme switches.
  $: if (typeof document !== 'undefined') document.documentElement.dataset.version = $version;

  onMount(() => startReminderWatcher());
</script>

<header class="topbar">
  <div class="container bar">
    <div class="brand">
      <h1>HGSS Companion</h1>
      <span class="muted tag">Pokémon HeartGold / SoulSilver</span>
    </div>
    <VersionPicker />
  </div>
</header>

<nav class="tabs">
  <div class="container tabrow">
    {#each tabs as t}
      <button class="tab" class:active={active === t.id} on:click={() => (active = t.id)}>
        <span class="icon">{t.icon}</span>{t.label}
      </button>
    {/each}
  </div>
</nav>

<main class="container">
  {#if active === 'today'}
    <TodayView />
  {:else if active === 'week'}
    <WeekView />
  {:else if active === 'rematches'}
    <RematchesView />
  {:else if active === 'route'}
    <RouteView />
  {/if}
</main>

<footer class="container foot muted">
  Datos de <a href="https://www.serebii.net/heartgoldsoulsilver" target="_blank" rel="noopener noreferrer">Serebii.net</a>.
  Proyecto de fans, sin afiliación con Nintendo / Game Freak.
</footer>

<style>
  .topbar {
    background: var(--accent);
    color: var(--accent-contrast);
  }
  .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
    flex-wrap: wrap;
  }
  .brand h1 {
    margin: 0;
    font-size: 1.2rem;
  }
  .tag {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.78rem;
  }
  .tabs {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .tabrow {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
  }
  .tab {
    flex: 1 0 auto;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-dim);
    padding: 0.7rem 0.6rem;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    justify-content: center;
    white-space: nowrap;
  }
  .tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
    font-weight: 600;
  }
  main {
    padding-top: 1.1rem;
  }
  .foot {
    font-size: 0.78rem;
    padding-top: 1.5rem;
  }
  .brand .tag {
    display: block;
  }
</style>
