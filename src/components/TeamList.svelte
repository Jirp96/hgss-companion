<script lang="ts">
  import type { TeamMember } from '../lib/types';
  export let team: TeamMember[];
  export let label = 'Equipo';
  let open = false;
</script>

{#if team.length}
  <details bind:open>
    <summary>{label} ({team.length})</summary>
    <ul class="team">
      {#each team as p}
        <li>{p.name}{#if p.level} <span class="muted">Lv. {p.level}</span>{/if}</li>
      {/each}
    </ul>
  </details>
{/if}

<style>
  summary {
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--text-dim);
  }
  .team {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.15rem 0.75rem;
    margin: 0.4rem 0 0;
    padding-left: 1.1rem;
    font-size: 0.88rem;
  }
</style>
