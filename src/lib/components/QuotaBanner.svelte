<script lang="ts">
  import type { TOrgUsage } from '$lib/types'

  let { usage }: { usage: TOrgUsage | null } = $props()

  type QuotaState = 'ok' | 'warning' | 'blocked'
  const WARN_THRESHOLD = 0.9

  function getQuotaState(u: TOrgUsage): QuotaState {
    if (u.ciMinutesLimit === 0) return 'ok'
    if (u.ciMinutesUsed >= u.ciMinutesLimit) return 'blocked'
    if (u.ciMinutesUsed >= u.ciMinutesLimit * WARN_THRESHOLD) return 'warning'
    return 'ok'
  }

  let state = $derived(usage ? getQuotaState(usage) : 'ok')
  let pct = $derived(usage && usage.ciMinutesLimit > 0
    ? Math.round((usage.ciMinutesUsed / usage.ciMinutesLimit) * 100)
    : 0)
</script>

{#if usage && state === 'blocked'}
  <div class="bg-red-900/80 border-b border-red-700 px-6 py-2.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="text-red-200 font-semibold text-sm">CI pipelines blocked</span>
      <span class="text-red-300/80 text-sm">
        {usage.ciMinutesUsed.toLocaleString()} / {usage.ciMinutesLimit.toLocaleString()} minutes used ({pct}%)
      </span>
    </div>
    <a href="/app/admin/subscription" class="text-sm bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors">
      Upgrade plan
    </a>
  </div>
{:else if usage && state === 'warning'}
  <div class="bg-amber-900/60 border-b border-amber-700/50 px-6 py-2 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="text-amber-200 font-medium text-sm">CI minutes running low</span>
      <span class="text-amber-300/70 text-sm">
        {usage.ciMinutesUsed.toLocaleString()} / {usage.ciMinutesLimit.toLocaleString()} minutes used ({pct}%)
      </span>
    </div>
    <a href="/app/admin/subscription" class="text-sm text-amber-300 hover:text-amber-200 transition-colors">
      View usage
    </a>
  </div>
{/if}
