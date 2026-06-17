<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import type { TOrg } from '$lib/types'

  let { orgs, activeOrgId }: { orgs: TOrg[]; activeOrgId: string } = $props()
  let open = $state(false)
  let ref: HTMLDivElement | undefined = $state()

  let activeOrg = $derived(orgs.find(o => o.id === activeOrgId))

  function handleClickOutside(e: MouseEvent) {
    if (ref && !ref.contains(e.target as Node)) {
      open = false
    }
  }

  $effect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  async function switchOrg(orgId: string) {
    await fetch('/app/switch-org', {
      method: 'POST',
      body: JSON.stringify({ orgId }),
      headers: { 'Content-Type': 'application/json' },
    })
    open = false
    await invalidateAll()
  }
</script>

{#if orgs.length <= 1}
  <span class="text-[11px] text-surface-400 border border-surface-700 px-2 py-0.5 rounded">
    {activeOrg?.displayName ?? activeOrgId}
  </span>
{:else}
  <div bind:this={ref} class="relative">
    <button
      onclick={() => open = !open}
      class="flex items-center gap-1.5 text-[11px] text-surface-400 border border-surface-700 px-2 py-0.5 rounded hover:border-surface-500 hover:text-surface-300 transition-colors"
    >
      {activeOrg?.displayName ?? activeOrgId}
      <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none">
        <path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    {#if open}
      <div class="absolute top-full left-0 mt-1 w-56 bg-surface-900 border border-surface-700 rounded-md shadow-xl z-50 py-1">
        <div class="px-3 py-1.5 text-[10px] uppercase tracking-wider text-surface-500">Organizations</div>
        {#each orgs as org}
          <button
            onclick={() => switchOrg(org.id)}
            class="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-800 transition-colors {org.id === activeOrgId ? 'text-white' : 'text-surface-400'}"
          >
            <div>
              <div class="text-sm font-medium">{org.displayName}</div>
              <div class="text-[10px] text-surface-500">{org.role}</div>
            </div>
            {#if org.id === activeOrgId}
              <svg class="w-4 h-4 text-accent-500" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
