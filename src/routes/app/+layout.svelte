<script lang="ts">
  import type { Snippet } from 'svelte'
  import Header from '$lib/components/Header.svelte'
  import QuotaBanner from '$lib/components/QuotaBanner.svelte'
  import SsoBarrier from '$lib/components/SsoBarrier.svelte'

  let { data, children }: { data: any; children: Snippet } = $props()

  const activeOrg = $derived(data.orgs.find((o: any) => o.id === data.activeOrgId))
</script>

<div class="min-h-screen bg-surface-950 text-surface-300">
  <Header orgs={data.orgs} activeOrgId={data.activeOrgId} />
  {#if data.ssoRequired}
    <SsoBarrier orgName={activeOrg?.displayName ?? 'This organization'} ssoEmailDomain={activeOrg?.ssoEmailDomain} />
  {:else}
    <QuotaBanner usage={data.usage} />
    {@render children()}
  {/if}
</div>
