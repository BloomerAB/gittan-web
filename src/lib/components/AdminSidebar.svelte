<script lang="ts">
  import { page } from '$app/state'

  let { orgId }: { orgId?: string } = $props()

  const PLATFORM_ORG_ID = 'bloomer'

  type TNavSection = {
    readonly heading?: string
    readonly links: ReadonlyArray<{ readonly path: string; readonly label: string }>
  }

  const adminSections: ReadonlyArray<TNavSection> = [
    {
      heading: 'Administration',
      links: [
        { path: '/app/admin/members', label: 'Members' },
        { path: '/app/admin/teams', label: 'Teams' },
        { path: '/app/admin/settings', label: 'Settings' },
        { path: '/app/admin/subscription', label: 'Subscription' },
        { path: '/app/admin/audit', label: 'Audit Log' },
      ],
    },
    {
      heading: 'Pipelines',
      links: [
        { path: '/app/admin/steps', label: 'Step Registry' },
        { path: '/app/admin/policies', label: 'Policies' },
      ],
    },
    {
      heading: 'Integrations',
      links: [
        { path: '/app/admin/integrations', label: 'Integrations' },
        { path: '/app/admin/auth', label: 'Authentication' },
        { path: '/app/admin/import', label: 'Import from GitHub' },
      ],
    },
  ]

  const platformLinks = [
    { path: '/app/admin/usage', label: 'Platform Usage' },
  ]

  let isPlatformOrg = $derived(orgId === PLATFORM_ORG_ID)
</script>

<nav class="w-52 border-r border-surface-800 min-h-[calc(100vh-48px)] p-4">
  {#each adminSections as section, i}
    {#if i > 0}
      <div class="border-t border-surface-800 my-3"></div>
    {/if}
    {#if section.heading}
      <p class="text-[11px] text-surface-600 uppercase tracking-wider mb-2">{section.heading}</p>
    {/if}
    {#each section.links as link}
      {@const active = page.url.pathname.startsWith(link.path)}
      <a
        href={link.path}
        class="block px-3 py-2 rounded-md text-sm mb-1 transition-colors {active
          ? 'bg-surface-900 text-white border-l-2 border-accent-400 pl-2.5'
          : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900'}"
      >
        {link.label}
      </a>
    {/each}
  {/each}
  {#if isPlatformOrg}
    <div class="border-t border-surface-800 my-3"></div>
    <p class="text-[11px] text-surface-600 uppercase tracking-wider mb-3">Platform</p>
    {#each platformLinks as link}
      {@const active = page.url.pathname.startsWith(link.path)}
      <a
        href={link.path}
        class="block px-3 py-2 rounded-md text-sm mb-1 transition-colors {active
          ? 'bg-surface-900 text-white border-l-2 border-accent-400 pl-2.5'
          : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900'}"
      >
        {link.label}
      </a>
    {/each}
  {/if}
</nav>
