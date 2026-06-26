<script lang="ts">
  import type { Snippet } from 'svelte'
  import TabNav from '$lib/components/TabNav.svelte'
  import type { TTeam, TRepo } from '$lib/types'

  let { data, children }: { data: any; children: Snippet } = $props()

  let team = $derived(data.team as TTeam)
  let repo = $derived(data.repo as TRepo)

  let basePath = $derived(`/app/${team.name}/${repo.name}`)

  let tabs = $derived([
    {
      label: 'Code',
      href: basePath,
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    },
    {
      label: 'Pipelines',
      href: `${basePath}/pipelines`,
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      label: 'Dependencies',
      href: `${basePath}/deps`,
      icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
    },
    {
      label: 'Settings',
      href: `${basePath}/settings`,
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
  ] as const)
</script>

<div class="p-6">
  <div class="mb-6">
    <div class="flex items-center gap-2 text-sm text-surface-500">
      <a href="/app/{team.name}" class="hover:text-surface-300 transition-colors">
        {team.displayName}
      </a>
      <span class="text-surface-700">/</span>
      <span class="text-white font-medium">{repo.name}</span>
      {#if repo.gatedBranches.length > 0}
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-accent-900 text-accent-400 ml-1">gated</span>
      {/if}
    </div>
  </div>

  <TabNav {tabs} {basePath} />

  {@render children()}
</div>
