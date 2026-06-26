<script lang="ts">
  import type { TOrg } from '$lib/types'

  let { data } = $props()

  let activeOrg = $derived((data.orgs as TOrg[]).find((o) => o.id === data.activeOrgId))
  let isTeamScoped = $derived(activeOrg?.pipelineScope === 'team')
</script>

<div>
  <h2 class="text-lg font-semibold text-surface-200 mb-1">Step Registry</h2>

  {#if isTeamScoped}
    <p class="text-sm text-surface-500 mb-6">
      Manage pipeline steps available to this team.
    </p>
  {:else}
    <div class="mt-4 px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 text-sm text-surface-500">
      Pipeline steps are managed at the organization level. Contact an org admin to configure steps and policies.
    </div>
  {/if}
</div>
