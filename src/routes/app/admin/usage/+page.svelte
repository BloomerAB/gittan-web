<script lang="ts">
  import MetricCard from '$lib/components/MetricCard.svelte'
  import { formatSize } from '$lib/types'

  let { data } = $props()

  let usage = $derived(data.platformUsage)

  function ciPercent(used: number, limit: number): number {
    if (limit === 0) return 0
    return Math.round((used / limit) * 100)
  }

  function quotaBadgeClass(status: 'ok' | 'warning' | 'blocked'): string {
    if (status === 'blocked') return 'bg-err-400/10 text-err-400'
    if (status === 'warning') return 'bg-yellow-400/10 text-yellow-400'
    return 'bg-ok-400/10 text-ok-400'
  }

  function ciBarClass(pct: number): string {
    if (pct > 90) return 'bg-err-400'
    if (pct > 70) return 'bg-yellow-400'
    return 'bg-accent-500'
  }
</script>

<div>
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Platform Usage</h2>

  {#if usage}
    <div class="grid grid-cols-5 gap-3 mb-6">
      <MetricCard
        label="Organizations"
        value={String(usage.summary.totalOrgs)}
        description="Active orgs on platform"
        color="zinc"
      />
      <MetricCard
        label="Revenue"
        value="&euro;{usage.summary.totalRevenue.toLocaleString()}"
        description="Monthly recurring"
        color="emerald"
      />
      <MetricCard
        label="CI Minutes"
        value={usage.summary.totalCiMinutes.toLocaleString()}
        description="Total consumed this month"
        color="zinc"
      />
      <MetricCard
        label="Blocked"
        value={String(usage.summary.blocked)}
        description="Orgs over quota"
        color={usage.summary.blocked > 0 ? 'red' : 'zinc'}
      />
      <MetricCard
        label="Warning"
        value={String(usage.summary.warning)}
        description="Orgs nearing quota"
        color={usage.summary.warning > 0 ? 'yellow' : 'zinc'}
      />
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-800 text-left">
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Org</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Plan</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4 w-48">CI Minutes</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Quota</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Storage</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Users</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Teams</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2 pr-4">Repos</th>
            <th class="text-[11px] uppercase text-surface-500 tracking-wider py-2">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {#each usage.orgs as org}
            {@const pct = ciPercent(org.ciMinutesUsed, org.ciMinutesLimit)}
            <tr class="border-b border-surface-800/50">
              <td class="py-2.5 pr-4 text-surface-300 font-mono">{org.orgId}</td>
              <td class="py-2.5 pr-4 text-surface-400">{org.plan}</td>
              <td class="py-2.5 pr-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full {ciBarClass(pct)}"
                      style="width: {Math.min(pct, 100)}%"
                    ></div>
                  </div>
                  <span class="text-xs text-surface-500 w-16 text-right">
                    {org.ciMinutesUsed}/{org.ciMinutesLimit}
                  </span>
                </div>
              </td>
              <td class="py-2.5 pr-4">
                <span class="text-[11px] px-2 py-0.5 rounded-full {quotaBadgeClass(org.quotaStatus)}">
                  {org.quotaStatus}
                </span>
              </td>
              <td class="py-2.5 pr-4 text-surface-400">{formatSize(org.storageBytes)}</td>
              <td class="py-2.5 pr-4 text-surface-400">{org.userCount}</td>
              <td class="py-2.5 pr-4 text-surface-400">{org.teamCount}</td>
              <td class="py-2.5 pr-4 text-surface-400">{org.repoCount}</td>
              <td class="py-2.5 text-surface-300">&euro;{org.monthlyRevenue}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="text-sm text-surface-500">No platform usage data available</p>
  {/if}
</div>
