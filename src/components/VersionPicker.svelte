<script lang="ts">
  import { version } from '../lib/stores';
  import type { Version } from '../lib/types';

  const options: { value: Version; label: string }[] = [
    { value: 'HG', label: 'HeartGold' },
    { value: 'SS', label: 'SoulSilver' },
  ];
</script>

<div class="picker" role="group" aria-label="Versión del juego">
  {#each options as opt}
    <button
      class="pill-btn"
      class:active={$version === opt.value}
      aria-pressed={$version === opt.value}
      on:click={() => version.set(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

<style>
  .picker {
    display: flex;
    gap: 0.4rem;
  }
</style>
