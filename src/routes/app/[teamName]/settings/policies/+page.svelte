<script lang="ts">
  type TPolicyStep = { position: 'before' | 'after'; name: string; use: string }
  type TPolicy = {
    id: string
    name: string
    description?: string
    matchFiles?: string
    matchName?: string
    steps: TPolicyStep[]
  }

  let { data } = $props()
  let policies = $derived((data.policies ?? []) as TPolicy[])
  let teamName = $derived(data.teamName as string)

  function matchSummary(p: TPolicy): string {
    const parts: string[] = []
    if (p.matchFiles) parts.push(`files: ${p.matchFiles}`)
    if (p.matchName) parts.push(`name: ${p.matchName}`)
    return parts.length ? parts.join(' · ') : 'all repos in team'
  }
</script>

<h2 class="text-lg font-semibold text-surface-200 mb-1">Policies</h2>
<p class="text-sm text-surface-500 mb-4">
  Policies decide <em>which steps run on which repos</em> for this team. Each policy
  matches on repo characteristics (files present, repo name) and runs its steps; a
  repo's pipeline is the union of steps from every matching policy. Git-versioned in
  <code class="text-surface-400">{teamName}-pipelines</code> (<code class="text-surface-400">policies/*.yaml</code>).
</p>

{#if policies.length === 0}
  <div class="rounded-lg border border-surface-800 bg-surface-900 p-6 text-center">
    <p class="text-sm text-surface-400">No team policies yet.</p>
    <p class="text-xs text-surface-600 mt-1">
      Add a <code>policies/&lt;name&gt;.yaml</code> to the <code>{teamName}-pipelines</code> repo.
    </p>
  </div>
{:else}
  <div class="space-y-2">
    {#each policies as p}
      <div class="px-4 py-3 rounded-lg bg-surface-900 border border-surface-800">
        <div class="flex items-center gap-2">
          <span class="text-sm text-white font-medium">{p.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-500">
            {p.steps.length} step{p.steps.length === 1 ? '' : 's'}
          </span>
        </div>
        {#if p.description}<p class="text-xs text-surface-400 mt-1">{p.description}</p>{/if}
        <p class="text-[11px] text-surface-600 mt-0.5">when · {matchSummary(p)}</p>
        <div class="flex flex-wrap gap-1.5 mt-2">
          {#each p.steps as s}
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-950 border border-surface-800 text-surface-400">→ {s.use}</span>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}
