<script lang="ts">
  let { title, description, command }: { title: string; description?: string; command?: string } = $props()
</script>

<div class="py-12 text-center">
  <p class="text-sm text-surface-500">{title}</p>
  {#if description}
    <p class="text-xs text-surface-600 mt-2">{description}</p>
  {/if}
  {#if command}
    <code class="block text-xs text-surface-400 bg-surface-900 border border-surface-800 rounded px-3 py-2 mt-3 mx-auto w-fit font-mono">
      {command}
    </code>
  {/if}
</div>
