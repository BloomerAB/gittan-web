<script lang="ts">
  type TStep = {
    scope: string
    name: string
    image: string
    run: string
    description?: string
  }

  let { data } = $props()
  let teamSteps = $derived((data.teamSteps ?? []) as TStep[])
  let orgSteps = $derived((data.orgSteps ?? []) as TStep[])
  let teamName = $derived(data.teamName as string)
</script>

<h2 class="text-lg font-semibold text-surface-200 mb-1">Steps</h2>
<p class="text-sm text-surface-500 mb-4">
  Steps are the reusable atoms a policy runs. Team steps are owned here (git-versioned
  in <code class="text-surface-400">{teamName}-pipelines</code>); org steps are shared
  across the whole org and can only be changed by org owners.
</p>

<h3 class="text-[11px] uppercase text-surface-500 tracking-wider mb-2">Team steps · editable in {teamName}-pipelines</h3>
{#if teamSteps.length === 0}
  <div class="rounded-lg border border-surface-800 bg-surface-900 p-4 text-center mb-6">
    <p class="text-xs text-surface-600">No team steps. Add <code>steps/&lt;name&gt;.yaml</code> to <code>{teamName}-pipelines</code>.</p>
  </div>
{:else}
  <div class="space-y-2 mb-6">
    {#each teamSteps as s}
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

{#if orgSteps.length > 0}
  <h3 class="text-[11px] uppercase text-surface-500 tracking-wider mb-2">
    Org steps · read-only <span class="text-surface-600">(managed in org-pipelines)</span>
  </h3>
  <div class="space-y-2">
    {#each orgSteps as s}
      <div class="px-4 py-3 rounded-lg bg-surface-950 border border-surface-800 opacity-80">
        <div class="flex items-center gap-2">
          <span class="text-sm text-surface-300 font-medium">{s.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-500 font-mono">{s.image}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-500">org · read-only</span>
        </div>
        {#if s.description}<p class="text-xs text-surface-500 mt-1">{s.description}</p>{/if}
      </div>
    {/each}
  </div>
{/if}
