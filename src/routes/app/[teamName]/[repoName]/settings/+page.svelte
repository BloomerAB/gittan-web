<script lang="ts">
  import type { TTeam, TRepo } from '$lib/types'

  let { data }: { data: any } = $props()

  let team = $derived(data.team as TTeam)
  let repo = $derived(data.repo as TRepo)
  let cloneUrl = $derived(`git@gittan.eu:${repo.forgejoFullName}.git`)
</script>

<div class="space-y-6">
  <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
    <h3 class="text-xs uppercase text-surface-500 tracking-wider mb-3">Gated Branches</h3>
    {#if repo.gatedBranches.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each repo.gatedBranches as branch}
          <span class="text-xs px-2 py-1 rounded bg-accent-900 text-accent-400 font-mono">{branch}</span>
        {/each}
      </div>
      <p class="text-xs text-surface-600 mt-3">
        Pushes to gated branches run the full pipeline before accepting. Rejected pushes are blocked at the pre-receive hook.
      </p>
    {:else}
      <p class="text-sm text-surface-600">No gated branches configured.</p>
      <p class="text-xs text-surface-600 mt-2">
        Enable gating with: <code class="text-surface-400 bg-surface-800 px-1.5 py-0.5 rounded">gittan repo gate {repo.name} --branch main</code>
      </p>
    {/if}
  </div>

  <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
    <h3 class="text-xs uppercase text-surface-500 tracking-wider mb-3">Clone URL</h3>
    <div class="flex items-center gap-2 px-3 py-2 bg-surface-950 border border-surface-800 rounded-md">
      <code class="text-sm text-surface-300 font-mono flex-1 truncate">{cloneUrl}</code>
    </div>
  </div>

  <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
    <h3 class="text-xs uppercase text-surface-500 tracking-wider mb-3">Team Ownership</h3>
    <p class="text-sm text-surface-400">
      This repository belongs to <span class="text-white font-medium">{team.displayName}</span>.
    </p>
    <p class="text-xs text-surface-600 mt-2">
      Transfer to another team with:
      <code class="text-surface-400 bg-surface-800 px-1.5 py-0.5 rounded">gittan repo transfer {repo.name} --to-team &lt;team-name&gt;</code>
    </p>
  </div>
</div>
