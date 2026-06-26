<script lang="ts">
  import { page } from '$app/state'

  let { teamName, pipelineScope }: { teamName: string; pipelineScope?: string } = $props()

  let showPipelines = $derived(pipelineScope === 'team')

  let basePath = $derived(`/app/${teamName}/admin`)

  type TNavLink = { readonly path: string; readonly label: string }

  let links = $derived.by(() => {
    const items: TNavLink[] = [
      { path: `${basePath}/import`, label: 'Import' },
      { path: `${basePath}/notifications`, label: 'Notifications' },
    ]

    if (showPipelines) {
      items.push(
        { path: `${basePath}/steps`, label: 'Step Registry' },
        { path: `${basePath}/policies`, label: 'Policies' },
      )
    }

    return items
  })
</script>

<nav class="w-52 border-r border-surface-800 min-h-[calc(100vh-48px)] p-4">
  <p class="text-[10px] text-accent-400/70 uppercase tracking-widest mb-4 font-medium">Team Admin</p>
  <p class="text-[11px] text-surface-600 uppercase tracking-wider mb-2">Settings</p>
  {#each links as link}
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
</nav>
