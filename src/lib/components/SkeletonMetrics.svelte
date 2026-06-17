<script lang="ts">
  import Skeleton from './Skeleton.svelte'
</script>

<div class="grid grid-cols-4 gap-4 mb-6">
  {#each Array(4) as _}
    <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 space-y-2">
      <Skeleton class="h-3 w-20" />
      <Skeleton class="h-7 w-12" />
      <Skeleton class="h-3 w-28" />
    </div>
  {/each}
</div>
