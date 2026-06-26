<script lang="ts">
  import type { Snippet } from 'svelte'
  import AdminSidebar from '$lib/components/AdminSidebar.svelte'

  let { data, children }: { data: any; children: Snippet } = $props()
</script>

<div class="flex">
  <AdminSidebar orgId={data.activeOrgId} pipelineScope={data.activeOrg?.pipelineScope} />
  <main class="flex-1">
    {@render children()}
  </main>
</div>
