<script lang="ts">
  import type { Snippet } from 'svelte'
  import TabNav from '$lib/components/TabNav.svelte'

  let { children }: { children: Snippet } = $props()

  const basePath = '/app/settings'

  const tabs = [
    {
      label: 'SSH Keys',
      href: `${basePath}/ssh-keys`,
      icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    },
  ] as const
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-lg font-semibold text-white">User Settings</h1>
  </div>
  <TabNav {tabs} {basePath} />
  {@render children()}
</div>
