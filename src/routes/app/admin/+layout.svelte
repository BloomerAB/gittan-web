<script lang="ts">
  import type { Snippet } from 'svelte'
  import { page } from '$app/state'
  import TabNav from '$lib/components/TabNav.svelte'

  let { data, children }: { data: any; children: Snippet } = $props()

  let showPipelines = $derived(data.activeOrg?.pipelineScope !== 'team')

  let basePath = '/app/admin'

  let currentPath = $derived(page.url.pathname)

  // The "Pipelines" area groups Steps + Policies; surface a sub-nav so both are
  // reachable (the top-level tab only points at Steps).
  let pipelineSubTabs = $derived([
    { label: 'Steps', href: `${basePath}/steps` },
    { label: 'Policies', href: `${basePath}/policies` },
  ])

  let inPipelines = $derived(
    pipelineSubTabs.some((t) => currentPath.startsWith(t.href)),
  )

  let tabs = $derived([
    {
      label: 'Members',
      href: `${basePath}/members`,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    },
    {
      label: 'Teams',
      href: `${basePath}/teams`,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    ...(showPipelines
      ? [
          {
            label: 'Pipelines',
            href: `${basePath}/steps`,
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            match: [`${basePath}/steps`, `${basePath}/policies`, `${basePath}/pipeline-config`],
          },
        ]
      : []),
    {
      label: 'Integrations',
      href: `${basePath}/integrations`,
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
      match: [`${basePath}/integrations`, `${basePath}/auth`],
    },
    {
      label: 'Settings',
      href: `${basePath}/settings`,
      match: [`${basePath}/settings`, `${basePath}/subscription`, `${basePath}/audit`],
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
  ] as const)
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-lg font-semibold text-white">Organization</h1>
  </div>
  <TabNav {tabs} {basePath} />
  {#if showPipelines && inPipelines}
    <div class="flex gap-1 -mt-2 mb-6">
      {#each pipelineSubTabs as sub}
        {@const active = currentPath.startsWith(sub.href)}
        <a
          href={sub.href}
          class="px-3 py-1.5 text-sm rounded-md transition-colors {active
            ? 'bg-surface-800 text-white'
            : 'text-surface-500 hover:text-surface-300 hover:bg-surface-900'}"
        >
          {sub.label}
        </a>
      {/each}
    </div>
  {/if}
  {@render children()}
</div>
