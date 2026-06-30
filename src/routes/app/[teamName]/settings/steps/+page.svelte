<script lang="ts">
  type TStep = {
    name: string
    image: string
    run: string
    description?: string
    cache?: string[]
  }

  let { data } = $props()
  let steps = $derived((data.steps ?? []) as TStep[])
</script>

<h2 class="text-lg font-semibold text-surface-200 mb-1">Steps</h2>
<p class="text-sm text-surface-500 mb-4">
  Steps are the reusable atoms a policy runs (e.g. <code class="text-surface-400">npm-build</code>,
  <code class="text-surface-400">docker-build</code>). Defined once, referenced by policies via
  <code class="text-surface-400">use:</code>. Shared across the org.
</p>

{#if steps.length === 0}
  <div class="rounded-lg border border-surface-800 bg-surface-900 p-6 text-center">
    <p class="text-sm text-surface-400">No steps defined.</p>
  </div>
{:else}
  <div class="space-y-2">
    {#each steps as s}
      <div class="px-4 py-3 rounded-lg bg-surface-900 border border-surface-800">
        <div class="flex items-center gap-2">
          <span class="text-sm text-white font-medium">{s.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-500 font-mono">{s.image}</span>
        </div>
        {#if s.description}<p class="text-xs text-surface-400 mt-1">{s.description}</p>{/if}
        <pre class="text-[11px] text-surface-500 mt-2 whitespace-pre-wrap font-mono">{s.run}</pre>
      </div>
    {/each}
  </div>
{/if}
