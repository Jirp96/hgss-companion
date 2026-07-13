<script lang="ts">
  import { gymLeaders, gymNote, gymSource, trainers, trainerNote, trainerSource } from '../lib/data';
  import { DAYS, DAY_LABELS, PERIOD_LABELS } from '../lib/dateUtils';
  import type { Day, Region } from '../lib/types';
  import RegionBadge from './RegionBadge.svelte';
  import TeamList from './TeamList.svelte';
  import SourceAttribution from './SourceAttribution.svelte';

  let regionFilter: Region | 'All' = 'All';
  let dayFilter: Day | 'All' = 'All';
  let tab: 'gym' | 'trainer' = 'gym';

  const regionMatch = (r: Region) => regionFilter === 'All' || r === regionFilter || r === 'Both';

  $: gyms = gymLeaders.filter(
    (g) => regionMatch(g.region) && (dayFilter === 'All' || g.callWindow.day === dayFilter)
  );
  $: trs = trainers.filter(
    (t) => regionMatch(t.region) && (dayFilter === 'All' || t.callDays.includes(dayFilter))
  );
</script>

<h2>Rematches</h2>

<div class="filters">
  <div class="row">
    <button class="pill-btn" class:active={tab === 'gym'} on:click={() => (tab = 'gym')}>
      Líderes ({gymLeaders.length})
    </button>
    <button class="pill-btn" class:active={tab === 'trainer'} on:click={() => (tab = 'trainer')}>
      Entrenadores ({trainers.length})
    </button>
  </div>

  <div class="row">
    <label>
      Región:
      <select bind:value={regionFilter}>
        <option value="All">Todas</option>
        <option value="Johto">Johto</option>
        <option value="Kanto">Kanto</option>
      </select>
    </label>
    <label>
      Día de llamada:
      <select bind:value={dayFilter}>
        <option value="All">Todos</option>
        {#each DAYS as d}<option value={d}>{DAY_LABELS[d]}</option>{/each}
      </select>
    </label>
  </div>
</div>

{#if tab === 'gym'}
  <p class="muted">{gymNote}</p>
  <div class="card scroll-x">
    <table class="stack">
      <thead>
        <tr><th>Líder</th><th>Tipo</th><th>Región</th><th>📞 Conseguir número</th><th>Llamar</th><th>Equipo</th></tr>
      </thead>
      <tbody>
        {#each gyms as g (g.leader)}
          <tr>
            <td data-label="Líder"><strong>{g.leader}</strong></td>
            <td data-label="Tipo">{g.type}</td>
            <td data-label="Región"><RegionBadge region={g.region} /></td>
            <td class="phone" data-label="Conseguir número">
              <strong>{g.phone.where}</strong><br />
              <span class="muted">{g.phone.when}</span><br />
              {g.phone.how}
            </td>
            <td data-label="Llamar">{DAY_LABELS[g.callWindow.day]}<br /><span class="muted">{PERIOD_LABELS[g.callWindow.period]}</span></td>
            <td data-label="Equipo"><TeamList team={g.team} /></td>
          </tr>
        {/each}
        {#if gyms.length === 0}
          <tr><td colspan="6" class="muted">Sin resultados para el filtro.</td></tr>
        {/if}
      </tbody>
    </table>
  </div>
  <SourceAttribution url={gymSource} label="Rematches de líderes" />
{:else}
  <p class="muted">
    {trainerNote} Registrá su número de Pokégear y llamalos en el día indicado.
  </p>
  <div class="card scroll-x">
    <table class="stack">
      <thead>
        <tr><th>Entrenador</th><th>Región</th><th>Ubicación</th><th>Días</th><th>Horario</th><th>Equipo</th></tr>
      </thead>
      <tbody>
        {#each trs as t (t.id)}
          <tr>
            <td data-label="Entrenador"><strong>{t.trainer}</strong></td>
            <td data-label="Región"><RegionBadge region={t.region} /></td>
            <td data-label="Ubicación">{t.location}</td>
            <td data-label="Días">{t.callDays.map((d) => DAY_LABELS[d]).join(', ')}</td>
            <td data-label="Horario">{PERIOD_LABELS[t.period]}<br /><span class="muted">{t.hours}</span></td>
            <td data-label="Equipo"><TeamList team={t.team} /></td>
          </tr>
        {/each}
        {#if trs.length === 0}
          <tr><td colspan="6" class="muted">Sin resultados para el filtro.</td></tr>
        {/if}
      </tbody>
    </table>
  </div>
  <SourceAttribution url={trainerSource} label="Rematches de entrenadores" />
{/if}

<style>
  .filters {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 0.9rem;
  }
  select {
    font: inherit;
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }
  label {
    font-size: 0.88rem;
  }
  .phone {
    min-width: 190px;
    font-size: 0.82rem;
  }
  @media (max-width: 640px) {
    .filters {
      gap: 0.5rem;
    }
    .phone {
      min-width: 0;
    }
  }
</style>
