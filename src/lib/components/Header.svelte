<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/state'
  import GittanLogo from './GittanLogo.svelte'
  import OrgSwitcher from './OrgSwitcher.svelte'
  import type { TOrg } from '$lib/types'

  let { orgs, activeOrgId, ssoIdentityEmail, userEmail }: {
    orgs: TOrg[]
    activeOrgId: string
    ssoIdentityEmail: string | null
    userEmail?: string
  } = $props()

  let isAdmin = $derived(page.url.pathname.startsWith('/app/admin'))
  let isSettings = $derived(page.url.pathname.startsWith('/app/settings'))
  let activeOrg = $derived(orgs.find((o) => o.id === activeOrgId))
  let isOwner = $derived(activeOrg?.role === 'owner')
  let userMenuOpen = $state(false)

  let dashboardHref = $derived.by(() => {
    if (isAdmin) {
      if (!browser) return '/app'
      const match = document.cookie.match(/(?:^|;\s*)gittan-last-path=([^;]+)/)
      return match ? decodeURIComponent(match[1]) : '/app'
    }
    return '/app/admin'
  })

  $effect(() => {
    if (!isAdmin && !isSettings) {
      document.cookie = `gittan-last-path=${encodeURIComponent(page.url.pathname)};path=/;max-age=31536000;SameSite=Lax`
    }
  })
</script>

<svelte:window onclick={() => userMenuOpen = false} />

<header class="border-b border-surface-800 px-6 h-12 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <a href="/app" class="flex items-center gap-2 text-white hover:text-surface-200 transition-colors">
      <GittanLogo size={22} />
      <span class="text-lg font-semibold tracking-tight">gittan<span style="color: #c4993a">.</span></span>
    </a>
    <OrgSwitcher {orgs} {activeOrgId} />
  </div>

  <div class="flex items-center gap-4">
    {#if ssoIdentityEmail}
      <span class="text-[11px] text-surface-500 font-mono">{ssoIdentityEmail}</span>
    {/if}
    <a href="/docs" class="text-surface-500 hover:text-surface-300 text-sm">Docs</a>
    {#if isOwner}
      <a
        href={dashboardHref}
        class="text-sm {isAdmin ? 'text-accent-400' : 'text-surface-500 hover:text-surface-300'}"
      >
        {isAdmin ? 'Dashboard' : 'Org Admin'}
      </a>
    {/if}
    <div class="relative">
      <button
        onclick={(e) => { e.stopPropagation(); userMenuOpen = !userMenuOpen }}
        class="text-sm {isSettings ? 'text-accent-400' : 'text-surface-500 hover:text-surface-300'} transition-colors"
      >
        {userEmail ?? 'Account'}
      </button>
      {#if userMenuOpen}
        <div class="absolute right-0 top-8 w-48 bg-surface-900 border border-surface-800 rounded-lg shadow-xl z-50 py-1">
          <a
            href="/app/settings"
            class="block px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            User Settings
          </a>
          <div class="border-t border-surface-800 my-1"></div>
          <a
            href="/auth/logout"
            class="block px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            Log out
          </a>
        </div>
      {/if}
    </div>
  </div>
</header>
