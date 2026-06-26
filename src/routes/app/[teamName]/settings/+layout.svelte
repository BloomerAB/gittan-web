<script lang="ts">
  import type { Snippet } from 'svelte'
  import { page } from '$app/state'
  import type { TOrg } from '$lib/types'

  let { data, children }: { data: any; children: Snippet } = $props()

  let teamName = $derived(page.params.teamName ?? '')
  let basePath = $derived(`/app/${teamName}/settings`)
  let activeOrg = $derived((data.orgs as TOrg[]).find((o: TOrg) => o.id === data.activeOrgId))

  type TNavItem = {
    readonly label: string
    readonly href?: string
    readonly heading?: boolean
  }

  let links = $derived<TNavItem[]>([
    { label: 'Import', href: `${basePath}/import` },
    { label: 'Notifications', href: `${basePath}/notifications` },
    { label: 'Pipelines', heading: true },
    { label: 'Steps', href: `${basePath}/steps` },
    { label: 'Policies', href: `${basePath}/policies` },
  ])
</script>

<div class="flex gap-6">
  <nav class="flex flex-col gap-1 w-40 shrink-0">
    {#each links as link}
      {#if link.heading}
        <p class="text-[11px] text-surface-600 uppercase tracking-wider mt-3 mb-1 px-3">{link.label}</p>
      {:else}
        {@const active = page.url.pathname.startsWith(link.href ?? '')}
        <a
          href={link.href}
          class="px-3 py-1.5 rounded text-sm transition-colors {active
            ? 'text-white bg-surface-900'
            : 'text-surface-500 hover:text-surface-300'}"
        >
          {link.label}
        </a>
      {/if}
    {/each}
  </nav>
  <div class="flex-1">
    {@render children()}
  </div>
</div>
