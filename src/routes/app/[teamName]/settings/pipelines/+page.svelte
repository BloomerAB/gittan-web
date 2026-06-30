<script lang="ts">
  type TSharedPipeline = {
    readonly name: string
    readonly mode: 'enforce' | 'default'
    readonly match: { files?: string[]; name?: string; tags?: string[] } | null
    readonly stepCount: number
    readonly steps: { name: string; use?: string; image?: string }[]
    readonly description: string
  }

  let { data } = $props()
  let sharedPipelines = $derived((data.sharedPipelines ?? []) as TSharedPipeline[])
  let teamName = $derived(data.teamName as string)

  function matchSummary(m: TSharedPipeline['match']): string {
    if (!m) return 'all repos in this team'
    const parts: string[] = []
    if (m.files?.length) parts.push(`files: ${m.files.join(', ')}`)
    if (m.name) parts.push(`name: ${m.name}`)
    if (m.tags?.length) parts.push(`tags: ${m.tags.join(', ')}`)
    return parts.length ? parts.join(' · ') : 'all repos in this team'
  }
</script>

<h2 class="text-lg font-semibold text-surface-200 mb-1">Shared pipelines</h2>
<p class="text-sm text-surface-500 mb-4">
  Central pipelines for this team, git-versioned in the
  <code class="text-surface-400">{teamName}-pipelines</code> repo
  (<code class="text-surface-400">pipelines/*.yaml</code>). A repo with no
  <code class="text-surface-400">.gittan.yaml</code> inherits the matching
  <span class="text-surface-300">default</span> one; <span class="text-surface-300">enforce</span>
  ones always run.
</p>

{#if sharedPipelines.length === 0}
  <div class="rounded-lg border border-surface-800 bg-surface-900 p-6 text-center">
    <p class="text-sm text-surface-400">No shared pipelines yet.</p>
    <p class="text-xs text-surface-600 mt-1">
      Add a <code>pipelines/&lt;name&gt;.yaml</code> to the
      <code>{teamName}-pipelines</code> repo and push.
    </p>
  </div>
{:else}
  <div class="space-y-2">
    {#each sharedPipelines as sp}
      <div class="px-4 py-3 rounded-lg bg-surface-900 border border-surface-800">
        <div class="flex items-center gap-2">
          <span class="text-sm text-white font-medium">{sp.name}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded {sp.mode === 'enforce'
              ? 'bg-yellow-400/15 text-yellow-300'
              : 'bg-surface-800 text-surface-400'}"
            title={sp.mode === 'enforce'
              ? 'Always runs — teams cannot opt out'
              : 'Default — a repo .gittan.yaml overrides it'}
          >{sp.mode}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-500">
            {sp.stepCount} step{sp.stepCount === 1 ? '' : 's'}
          </span>
        </div>
        {#if sp.description}
          <p class="text-xs text-surface-400 mt-1">{sp.description}</p>
        {/if}
        <p class="text-[11px] text-surface-600 mt-0.5">applies to · {matchSummary(sp.match)}</p>
        <div class="flex flex-wrap gap-1.5 mt-2">
          {#each sp.steps as step}
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-950 border border-surface-800 text-surface-400">
              {step.name}
            </span>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}
