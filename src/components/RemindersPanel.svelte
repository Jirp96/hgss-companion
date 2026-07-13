<script lang="ts">
  import { reminders } from '../lib/stores';
  import { notificationsEnabled, requestNotifications } from '../lib/notify';

  function remove(id: string) {
    reminders.update((list) => list.filter((r) => r.id !== id));
  }

  $: sorted = [...$reminders].sort((a, b) => a.time.localeCompare(b.time));
</script>

<section class="card">
  <div class="head">
    <h2>⏰ Recordatorios</h2>
    {#if !$notificationsEnabled}
      <button class="pill-btn" on:click={requestNotifications}>Activar notificaciones</button>
    {:else}
      <span class="muted">Notificaciones activas</span>
    {/if}
  </div>

  {#if sorted.length === 0}
    <p class="muted">Sin recordatorios. Usá “⏰ Recordar” en un evento para agregar uno.</p>
  {:else}
    <ul class="list">
      {#each sorted as r (r.id)}
        <li>
          <span><strong>{r.time}</strong> — {r.label}</span>
          <button class="link" on:click={() => remove(r.id)} aria-label="Eliminar">✕</button>
        </li>
      {/each}
    </ul>
    <p class="muted note">
      Los avisos solo suenan con la pestaña abierta (sin servidor no hay push real).
    </p>
  {/if}
</section>

<style>
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  .head h2 {
    font-size: 1.05rem;
    margin: 0;
  }
  .list {
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
  }
  .list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 0;
    border-bottom: 1px solid var(--border);
  }
  .link {
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 1rem;
  }
  .note {
    font-size: 0.78rem;
    margin: 0.5rem 0 0;
  }
</style>
