<script lang="ts">
  import { page } from '$app/state'

  type Tab = {
    readonly label: string
    readonly href: string
    readonly icon: string
    readonly match?: readonly string[]
  }

  let { tabs, basePath }: { tabs: readonly Tab[]; basePath: string } = $props()

  let currentPath = $derived(page.url.pathname)

  function isActive(tab: Tab): boolean {
    if (tab.match) {
      return tab.match.some((prefix) => currentPath.startsWith(prefix))
    }
    if (tab.href === basePath) {
      return currentPath === basePath || !tabs.some((t) => t.href !== basePath && currentPath.startsWith(t.href))
    }
    return currentPath.startsWith(tab.href)
  }
</script>

<nav class="flex border-b border-surface-800 mb-6">
  {#each tabs as tab}
    {@const active = isActive(tab)}
    <a
      href={tab.href}
      class="flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors {active
        ? 'text-white border-accent-400'
        : 'text-surface-500 border-transparent hover:text-surface-300'}"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d={tab.icon} />
      </svg>
      {tab.label}
    </a>
  {/each}
</nav>
