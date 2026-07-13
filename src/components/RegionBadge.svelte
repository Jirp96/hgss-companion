<script lang="ts">
  import type { Region } from '../lib/types';
  export let region: Region;
  const cls: Record<Region, string> = {
    Johto: 'badge-johto',
    Kanto: 'badge-kanto',
    Both: 'badge-both',
  };
  const label: Record<Region, string> = {
    Johto: 'Johto',
    Kanto: 'Kanto',
    Both: 'Johto/Kanto',
  };
</script>

<span class="badge {cls[region]}">{label[region]}</span>
