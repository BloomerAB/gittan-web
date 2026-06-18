<script lang="ts">
  import { page } from '$app/state'
  import GittanLogo from './GittanLogo.svelte'
  import OrgSwitcher from './OrgSwitcher.svelte'
  import type { TOrg } from '$lib/types'

  let { orgs, activeOrgId }: { orgs: TOrg[]; activeOrgId: string } = $props()
  let isAdmin = $derived(page.url.pathname.startsWith('/app/admin'))
</script>

<header class="border-b border-surface-800 px-6 h-12 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <a href="/app" class="flex items-center gap-2 text-white hover:text-surface-200 transition-colors">
      <GittanLogo size={22} />
      <span class="text-lg font-semibold tracking-tight">gittan</span>
    </a>
    <OrgSwitcher {orgs} {activeOrgId} />
  </div>

  <div class="flex items-center gap-4">
    <a href="/docs" class="text-surface-500 hover:text-surface-300 text-sm">Docs</a>
    <a
      href={isAdmin ? '/app' : '/app/admin'}
      class="text-surface-500 hover:text-surface-300 text-sm"
    >
      {isAdmin ? 'Dashboard' : 'Admin'}
    </a>
    <a href="/auth/logout" class="text-surface-500 hover:text-surface-300 text-sm">
      Log out
    </a>
  </div>
</header>
