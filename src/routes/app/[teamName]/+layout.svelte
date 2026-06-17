<script lang="ts">
  import type { Snippet } from 'svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'

  let { data, children }: { data: any; children: Snippet } = $props()

  let repoCounts = $derived(
    Object.fromEntries(
      Object.entries(data.reposByTeam as Record<string, any[]>).map(([id, repos]) => [id, repos.length]),
    ),
  )
</script>

<div class="flex">
  <Sidebar teams={data.teams} {repoCounts} />
  <main class="flex-1">{@render children()}</main>
</div>
