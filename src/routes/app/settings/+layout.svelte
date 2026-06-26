<script lang="ts">
  import type { Snippet } from 'svelte'
  import UserSettingsSidebar from '$lib/components/UserSettingsSidebar.svelte'

  let { children }: { children: Snippet } = $props()
</script>

<div class="flex">
  <UserSettingsSidebar />
  <main class="flex-1">
    {@render children()}
  </main>
</div>
