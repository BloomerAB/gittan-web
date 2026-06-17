<script lang="ts">
  import Skeleton from './Skeleton.svelte'
</script>

<div class="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-900 border border-surface-800">
  <Skeleton class="w-2 h-2 rounded-full" />
  <div class="flex-1 space-y-2">
    <Skeleton class="h-4 w-32" />
    <Skeleton class="h-3 w-64" />
  </div>
  <Skeleton class="h-4 w-16" />
</div>
