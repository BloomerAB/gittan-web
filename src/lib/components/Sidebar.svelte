<script lang="ts">
  import { page } from '$app/state'
  import type { TTeam } from '$lib/types'

  let { teams, repoCounts }: { teams: TTeam[]; repoCounts: Record<string, number> } = $props()
  let teamName = $derived(page.params.teamName)
</script>

<nav class="w-52 border-r border-surface-800 min-h-[calc(100vh-48px)] p-4">
  <p class="text-[11px] text-surface-600 uppercase tracking-wider mb-3">Teams</p>
  {#each teams as team}
    {@const active = teamName === team.name}
    <a
      href="/app/{team.name}"
      class="block px-3 py-2 rounded-md text-sm mb-1 transition-colors {active
        ? 'bg-surface-900 text-white border-l-2 border-accent-400 pl-2.5'
        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900'}"
    >
      <span class="block font-medium leading-snug">{team.displayName}</span>
      <span class="text-[11px] text-surface-600">{repoCounts[team.id] ?? 0} repos</span>
    </a>
  {/each}
</nav>
