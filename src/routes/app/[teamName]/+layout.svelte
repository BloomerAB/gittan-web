<script lang="ts">
  import type { Snippet } from 'svelte'
  import { page } from '$app/state'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import TabNav from '$lib/components/TabNav.svelte'
  import type { TTeam } from '$lib/types'

  let { data, children }: { data: any; children: Snippet } = $props()

  let repoCounts = $derived(
    Object.fromEntries(
      Object.entries(data.reposByTeam as Record<string, any[]>).map(([id, repos]) => [id, repos.length]),
    ),
  )

  let teamName = $derived(page.params.teamName ?? '')
  let basePath = $derived(`/app/${teamName}`)

  let isRepoView = $derived(
    page.params.repoName !== undefined,
  )

  let tabs = $derived([
    {
      label: 'Repos',
      href: basePath,
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    },
    {
      label: 'Pipelines',
      href: `${basePath}/pipelines`,
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      label: 'Settings',
      href: `${basePath}/settings`,
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
  ] as const)
</script>

<div class="flex">
  <Sidebar teams={data.teams} {repoCounts} />
  <main class="flex-1">
    {#if isRepoView}
      {@render children()}
    {:else}
      <div class="p-6">
        <div class="mb-6">
          <h1 class="text-lg font-semibold text-white">
            {(data.teams as TTeam[]).find((t) => t.name === teamName)?.displayName ?? teamName}
          </h1>
        </div>
        <TabNav {tabs} {basePath} />
        {@render children()}
      </div>
    {/if}
  </main>
</div>
