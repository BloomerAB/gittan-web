<script lang="ts">
  import { formatSize } from '$lib/types'

  let { data } = $props()

  let usage = $derived(data.usage)

  let storagePercent = $derived(
    usage ? Math.round((usage.storageBytes / (10 * 1024 * 1024 * 1024)) * 100) : 0,
  )
  let ciPercent = $derived(
    usage ? Math.round((usage.ciMinutesUsed / usage.ciMinutesLimit) * 100) : 0,
  )
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Subscription</h2>

  <div class="max-w-2xl space-y-6">
    <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
      <div class="flex items-center justify-between mb-1">
        <p class="text-sm text-surface-300">Current Plan</p>
        <span class="text-xs bg-accent-600/20 text-accent-400 px-2 py-0.5 rounded-full">Team</span>
      </div>
      <p class="text-2xl font-semibold text-surface-200">&euro;199<span class="text-sm text-surface-500 font-normal">/mo</span></p>
      <p class="text-xs text-surface-600 mt-1">Includes 5 teams, 3000 CI min/mo, 10 GB storage</p>
    </div>

    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Usage</p>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-surface-400">Storage</span>
            <span class="text-surface-500">
              {usage ? formatSize(usage.storageBytes) : '—'} / 10 GB
            </span>
          </div>
          <div class="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all {storagePercent > 90
                ? 'bg-err-400'
                : storagePercent > 70
                  ? 'bg-yellow-400'
                  : 'bg-accent-500'}"
              style="width: {storagePercent}%"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-surface-400">CI Minutes</span>
            <span class="text-surface-500">
              {usage ? usage.ciMinutesUsed.toLocaleString() : '—'} / {usage ? usage.ciMinutesLimit.toLocaleString() : '—'}
            </span>
          </div>
          <div class="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all {ciPercent > 90
                ? 'bg-err-400'
                : ciPercent > 70
                  ? 'bg-yellow-400'
                  : 'bg-accent-500'}"
              style="width: {ciPercent}%"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Add-ons</p>
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-3">
          <p class="text-sm text-surface-300">Extra CI block</p>
          <p class="text-lg font-semibold text-surface-200">&euro;29<span class="text-xs text-surface-500 font-normal">/mo</span></p>
          <p class="text-[11px] text-surface-600">+1000 CI min/mo</p>
        </div>
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-3">
          <p class="text-sm text-surface-300">Extra storage</p>
          <p class="text-lg font-semibold text-surface-200">&euro;9<span class="text-xs text-surface-500 font-normal">/mo</span></p>
          <p class="text-[11px] text-surface-600">+10 GB storage</p>
        </div>
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-3">
          <p class="text-sm text-surface-300">Extra team</p>
          <p class="text-lg font-semibold text-surface-200">&euro;19<span class="text-xs text-surface-500 font-normal">/mo</span></p>
          <p class="text-[11px] text-surface-600">+1 team slot</p>
        </div>
      </div>
    </div>

    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Billing</p>
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-surface-500">Payment method</span>
          <span class="text-surface-300">Visa ****4242</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-surface-500">Next invoice</span>
          <span class="text-surface-300">Jul 1, 2026</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-surface-500">Billing email</span>
          <span class="text-surface-300">billing@example.com</span>
        </div>
      </div>
    </div>
  </div>
</div>
