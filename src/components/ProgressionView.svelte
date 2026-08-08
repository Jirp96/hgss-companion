<script lang="ts">
  import { progression, progressionSteps, badges, progressionSource } from '../lib/data';
  import { progress, version } from '../lib/stores';
  import type { ProgressionStep, StepKind } from '../lib/types';
  import RegionBadge from './RegionBadge.svelte';
  import SourceAttribution from './SourceAttribution.svelte';

  const KIND_ICON: Record<StepKind, string> = {
    story: '📖',
    gym: '🏅',
    rocket: '🚀',
    rival: '⚔️',
    league: '👑',
    legendary: '✨',
    unlock: '🔓',
  };
  const KIND_LABEL: Record<StepKind, string> = {
    story: 'Historia',
    gym: 'Gimnasio',
    rocket: 'Team Rocket',
    rival: 'Rival',
    league: 'Liga',
    legendary: 'Legendario',
    unlock: 'Desbloqueo',
  };

  const orderedIds = progressionSteps.map((s) => s.id);
  const requiredIds = progressionSteps.filter((s) => !s.optional).map((s) => s.id);

  let onlyPending = false;
  let hideOptional = false;

  $: doneSet = new Set($progress);
  $: doneCount = progressionSteps.filter((s) => doneSet.has(s.id)).length;
  $: requiredDone = requiredIds.filter((id) => doneSet.has(id)).length;
  $: pct = Math.round((doneCount / progressionSteps.length) * 100);
  $: badgeCount = badges.filter((b) => doneSet.has(b.stepId)).length;
  $: nextStep = progressionSteps.find((s) => !s.optional && !doneSet.has(s.id)) ?? null;

  // Derivado reactivo: los conteos y el filtrado dependen de `doneSet` y de los
  // toggles, que no aparecen en las expresiones del template. Calcularlos acá
  // garantiza que la vista se actualice al marcar un paso.
  $: chapterViews = progression.map((ch) => ({
    ...ch,
    doneCount: ch.steps.filter((s) => doneSet.has(s.id)).length,
    shown: ch.steps.filter(
      (s: ProgressionStep) =>
        !(hideOptional && s.optional) && !(onlyPending && doneSet.has(s.id))
    ),
  }));

  function jumpTo(id: string) {
    document.getElementById(`step-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetAll() {
    if (confirm('¿Borrar todo el progreso marcado de la guía?')) progress.reset();
  }
</script>

<h2>Progresión</h2>

<p class="muted intro">
  Toda la historia de HeartGold / SoulSilver en orden: los 16 gimnasios, la Liga, el viaje a Kanto,
  Red, y lo que se desbloquea en cada paso. Marcá cada punto a medida que lo pasás — queda guardado
  en este navegador.
</p>

<!-- Resumen general -->
<div class="card summary">
  <div class="sum-row">
    <div>
      <strong>{doneCount}</strong><span class="muted"> / {progressionSteps.length} pasos</span>
      <div class="muted small">{requiredDone} / {requiredIds.length} obligatorios · {badgeCount} / 16 medallas</div>
    </div>
    <div class="pct">{pct}%</div>
  </div>
  <div class="bar"><div class="fill" style="width:{pct}%"></div></div>

  {#if nextStep}
    <button class="next" on:click={() => nextStep && jumpTo(nextStep.id)}>
      <span class="next-label">Próximo paso</span>
      <span class="next-name">{KIND_ICON[nextStep.kind]} {nextStep.name}</span>
      <span class="muted small">{nextStep.location}</span>
    </button>
  {:else}
    <p class="done-all">🎉 Guía completa. Ya no queda nada obligatorio por hacer.</p>
  {/if}
</div>

<!-- Tablero de medallas -->
<h3 class="sec">Medallas</h3>
<div class="card">
  {#each ['Johto', 'Kanto'] as reg}
    <div class="badge-row">
      <span class="badge-region {reg === 'Johto' ? 'badge-johto' : 'badge-kanto'} badge">{reg}</span>
      <div class="badge-grid">
        {#each badges.filter((b) => b.badge.region === reg) as b (b.stepId)}
          <button
            class="medal"
            class:got={doneSet.has(b.stepId)}
            on:click={() => jumpTo(b.stepId)}
            title="{b.badge.es} — {b.badge.leader} ({b.badge.type})"
          >
            <span class="medal-disc">{doneSet.has(b.stepId) ? '★' : b.badge.order}</span>
            <span class="medal-name">{b.badge.es}</span>
            <span class="medal-leader muted">{b.badge.leader}</span>
          </button>
        {/each}
      </div>
    </div>
  {/each}
</div>

<!-- Controles + salto por capítulo -->
<div class="controls">
  <div class="row">
    <button class="pill-btn" class:active={onlyPending} on:click={() => (onlyPending = !onlyPending)}>
      Solo pendientes
    </button>
    <button class="pill-btn" class:active={hideOptional} on:click={() => (hideOptional = !hideOptional)}>
      Ocultar opcionales
    </button>
    <button class="pill-btn" on:click={resetAll}>Reiniciar</button>
  </div>
  <div class="row jumps">
    {#each chapterViews as ch (ch.id)}
      <button class="jump" on:click={() => jumpTo(ch.steps[0].id)}>
        {ch.title} <span class="muted">({ch.doneCount}/{ch.steps.length})</span>
      </button>
    {/each}
  </div>
</div>

<!-- Línea de tiempo -->
{#each chapterViews as ch (ch.id)}
  <section class="chapter">
    <header class="ch-head">
      <div class="ch-title">
        <h3>{ch.title}</h3>
        <RegionBadge region={ch.region} />
      </div>
      <p class="muted small">{ch.subtitle}</p>
      {#if ch.links.length}
        <div class="links">
          <span class="lbl">Serebii:</span>
          {#each ch.links as l}
            <a class="slink" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
          {/each}
        </div>
      {/if}
      <div class="bar thin">
        <div class="fill" style="width:{Math.round((ch.doneCount / ch.steps.length) * 100)}%"></div>
      </div>
    </header>

    {#if ch.shown.length === 0}
      <p class="muted empty">Nada para mostrar con los filtros actuales.</p>
    {:else}
      <ol class="timeline">
        {#each ch.shown as s (s.id)}
          {@const isDone = doneSet.has(s.id)}
          <li class="step" class:done={isDone} class:is-next={nextStep?.id === s.id} id="step-{s.id}">
            <button
              class="node kind-{s.kind}"
              aria-pressed={isDone}
              aria-label="Marcar «{s.name}» como completado"
              on:click={() => progress.toggle(s.id)}
            >
              {isDone ? '✔' : KIND_ICON[s.kind]}
            </button>

            <div class="body">
              <div class="head">
                <h4>{s.name}</h4>
                {#if s.optional}<span class="tag-opt">opcional</span>{/if}
              </div>

              <div class="meta muted">
                <span class="kind">{KIND_LABEL[s.kind]}</span>
                <span>·</span>
                <span>{s.location}</span>
                {#if s.level !== '—'}<span>·</span><span class="lvl">{s.level}</span>{/if}
              </div>

              {#if s.badge}
                <p class="award">
                  🏅 <strong>{s.badge.es}</strong> <span class="muted">({s.badge.en}) — {s.badge.leader}, tipo {s.badge.type}</span>
                </p>
              {/if}

              <p class="detail">{s.detail}</p>

              {#if s.versionNotes?.[$version]}
                <p class="vnote"><strong>{$version}:</strong> {s.versionNotes?.[$version]}</p>
              {/if}

              {#if s.items.length}
                <p class="line"><span class="lbl">Obtenés:</span> {s.items.join(' · ')}</p>
              {/if}

              {#if s.unlocks.length}
                <div class="line">
                  <span class="lbl">Desbloquea:</span>
                  {#each s.unlocks as u}<span class="chip">{u}</span>{/each}
                </div>
              {/if}

              {#if s.links.length}
                <div class="line links">
                  <span class="lbl">Serebii:</span>
                  {#each s.links as l}
                    <a class="slink" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
                  {/each}
                </div>
              {/if}

              <div class="actions">
                <button class="mini" on:click={() => progress.toggle(s.id)}>
                  {isDone ? 'Desmarcar' : 'Marcar como hecho'}
                </button>
                <button class="mini" on:click={() => progress.completeThrough(orderedIds, s.id)}>
                  Marcar todo hasta acá
                </button>
              </div>
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </section>
{/each}

<SourceAttribution url={progressionSource} label="Guía de progresión" />

<style>
  .intro {
    margin-top: 0.5rem;
  }
  .sec {
    font-size: 0.95rem;
    margin-top: 1.2rem;
  }

  /* Resumen */
  .sum-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.6rem;
  }
  .sum-row strong {
    font-size: 1.35rem;
  }
  .pct {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--accent-dark);
  }
  .small {
    font-size: 0.78rem;
  }
  .bar {
    height: 12px;
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 0.5rem;
  }
  .bar.thin {
    height: 7px;
    margin-top: 0.4rem;
  }
  .fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.2s ease;
  }
  .next {
    display: block;
    width: 100%;
    text-align: left;
    margin-top: 0.7rem;
    background: var(--surface-2);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius);
    padding: 0.5rem 0.6rem;
    color: var(--text);
  }
  .next:hover {
    border-color: var(--accent-dark);
  }
  .next-label {
    display: block;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-dim);
    font-weight: 700;
  }
  .next-name {
    display: block;
    font-weight: 700;
  }
  .done-all {
    margin: 0.7rem 0 0;
    font-weight: 700;
  }

  /* Medallas */
  .badge-row {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    margin-bottom: 0.7rem;
  }
  .badge-row:last-child {
    margin-bottom: 0;
  }
  .badge-region {
    margin-top: 0.3rem;
    flex: 0 0 auto;
  }
  .badge-grid {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 0.35rem;
    flex: 1;
  }
  .medal {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    background: none;
    border: none;
    padding: 0.2rem 0;
    color: var(--text-dim);
    text-align: center;
    line-height: 1.15;
  }
  .medal-disc {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    border: 2px dashed var(--border-strong);
    background: var(--surface-2);
    font-weight: 700;
    font-size: 0.8rem;
  }
  .medal.got .medal-disc {
    border: 2px solid var(--accent-dark);
    background: var(--accent);
    color: var(--accent-contrast);
  }
  .medal.got {
    color: var(--text);
  }
  .medal-name {
    font-size: 0.6rem;
    font-weight: 700;
  }
  .medal-leader {
    font-size: 0.58rem;
  }

  /* Controles */
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0 0.9rem;
  }
  .jumps {
    gap: 0.3rem;
  }
  .jump {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0.2rem 0.5rem;
    font-size: 0.76rem;
    color: var(--text);
  }
  .jump:hover {
    border-color: var(--accent-dark);
  }

  /* Capítulos */
  .chapter {
    margin-bottom: 1.4rem;
  }
  .ch-head {
    background: var(--surface-2);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius) var(--radius) 0 0;
    padding: 0.55rem 0.7rem;
  }
  .ch-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .ch-head h3 {
    margin: 0;
    font-size: 0.98rem;
  }
  .ch-head p {
    margin: 0.25rem 0 0;
  }
  .empty {
    border: 1px solid var(--border-strong);
    border-top: none;
    padding: 0.6rem 0.7rem;
    margin: 0;
    background: var(--surface);
  }

  /* Timeline */
  .timeline {
    list-style: none;
    margin: 0;
    padding: 0.7rem 0.7rem 0.2rem;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-top: none;
    border-radius: 0 0 var(--radius) var(--radius);
  }
  .step {
    display: grid;
    grid-template-columns: 30px 1fr;
    gap: 0.6rem;
    position: relative;
    padding-bottom: 0.9rem;
  }
  /* La línea que une los nodos. */
  .step::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 30px;
    bottom: -2px;
    width: 2px;
    background: var(--border);
  }
  .step:last-child::before {
    display: none;
  }
  .step.done::before {
    background: var(--accent);
  }
  .node {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    border: 2px solid var(--border-strong);
    background: var(--surface-2);
    font-size: 0.85rem;
    padding: 0;
    z-index: 1;
  }
  .node:hover {
    border-color: var(--accent-dark);
  }
  .step.done .node {
    background: var(--accent);
    border-color: var(--accent-dark);
    color: var(--accent-contrast);
    font-size: 1rem;
  }
  .body {
    min-width: 0;
  }
  .step.done .body {
    opacity: 0.62;
  }
  .step.is-next .body {
    border-left: 3px solid var(--accent);
    padding-left: 0.5rem;
    margin-left: -0.5rem;
  }
  .head {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .head h4 {
    margin: 0;
    font-size: 0.92rem;
    font-family: 'Trebuchet MS', Verdana, Arial, sans-serif;
  }
  .step.done .head h4 {
    text-decoration: line-through;
  }
  .tag-opt {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border: 1px solid var(--border-strong);
    border-radius: 3px;
    padding: 0 0.3rem;
    color: var(--text-dim);
  }
  .meta {
    font-size: 0.76rem;
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }
  .kind {
    font-weight: 700;
  }
  .lvl {
    font-weight: 700;
    color: var(--accent-dark);
  }
  .award {
    margin: 0.35rem 0 0;
    font-size: 0.82rem;
  }
  .detail {
    margin: 0.35rem 0 0;
    font-size: 0.84rem;
  }
  .vnote {
    margin: 0.35rem 0 0;
    font-size: 0.8rem;
    background: var(--surface-2);
    border-left: 3px solid var(--accent);
    padding: 0.3rem 0.5rem;
  }
  .line {
    margin: 0.35rem 0 0;
    font-size: 0.8rem;
  }
  .lbl {
    font-weight: 700;
    color: var(--text-dim);
    text-transform: uppercase;
    font-size: 0.68rem;
    letter-spacing: 0.03em;
    margin-right: 0.25rem;
  }
  .chip {
    display: inline-block;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0.05rem 0.35rem;
    margin: 0.12rem 0.2rem 0 0;
    font-size: 0.74rem;
  }
  .links {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .ch-head .links {
    margin-top: 0.35rem;
    font-size: 0.8rem;
  }
  .slink {
    display: inline-block;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0.05rem 0.35rem;
    font-size: 0.74rem;
    color: var(--accent-dark);
    text-decoration: none;
  }
  .slink::after {
    content: ' ↗';
    font-size: 0.68rem;
    opacity: 0.7;
  }
  .slink:hover {
    border-color: var(--accent-dark);
    text-decoration: underline;
  }
  .actions {
    margin-top: 0.4rem;
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .mini {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--text-dim);
    font-size: 0.72rem;
    padding: 0.12rem 0.4rem;
  }
  .mini:hover {
    border-color: var(--accent-dark);
    color: var(--text);
  }

  @media (max-width: 640px) {
    .badge-row {
      flex-direction: column;
      gap: 0.3rem;
    }
    .badge-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.5rem 0.3rem;
      width: 100%;
    }
    .medal-name {
      font-size: 0.62rem;
    }
  }
</style>
