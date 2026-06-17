<script lang="ts">
  import type { Snippet } from 'svelte'
  import Header from '$lib/components/Header.svelte'
  import QuotaBanner from '$lib/components/QuotaBanner.svelte'

  let { data, children }: { data: any; children: Snippet } = $props()
</script>

<div class="min-h-screen bg-surface-950 text-surface-300">
  <Header orgs={data.orgs} activeOrgId={data.activeOrgId} />
  <QuotaBanner usage={data.usage} />
  {@render children()}
</div>
