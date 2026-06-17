<script lang="ts">
  let { class: className = '' }: { class?: string } = $props()
</script>

<div class="bg-surface-800 animate-pulse rounded {className}"></div>
