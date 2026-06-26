<script lang="ts">
  import type { Snippet } from 'svelte'
  import { page } from '$app/state'
  import TeamAdminSidebar from '$lib/components/TeamAdminSidebar.svelte'
  import type { TOrg } from '$lib/types'

  let { data, children }: { data: any; children: Snippet } = $props()

  let activeOrg = $derived((data.orgs as TOrg[]).find((o) => o.id === data.activeOrgId))
</script>

<div class="flex">
  <TeamAdminSidebar teamName={page.params.teamName ?? ''} pipelineScope={activeOrg?.pipelineScope} />
  <main class="flex-1">
    {@render children()}
  </main>
</div>
