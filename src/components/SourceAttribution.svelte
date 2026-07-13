<script lang="ts">
  export let url: string;
  export let label = 'Ver en Serebii';
</script>

<p class="attr muted">
  Datos obtenidos de <a href={url} target="_blank" rel="noopener noreferrer">Serebii.net</a> —
  <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
</p>

<style>
  .attr {
    margin: 0.5rem 0 0;
    font-size: 0.8rem;
  }
</style>
