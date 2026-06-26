<script lang="ts">
  import { enhance } from '$app/forms'
  import { formatSize } from '$lib/types'

  let { data, form } = $props()

  const plan = $derived(data.plan)
  const usage = $derived(data.usage)

  const BLOCK_PRICE = 129

  const plans = {
    personal: { label: 'Personal', price: 'Free', description: '50 CI min/mo, 1 GB storage' },
    starter: { label: 'Starter', price: '€39/mo', description: '2,000 CI min/mo, 20 GB storage, AI enabled' },
    team: { label: 'Team', price: '€199/mo', description: '10,000 CI min/mo, 100 GB storage, AI enabled' },
  } as const

  const currentPlan = $derived(plans[(plan?.plan ?? 'personal') as keyof typeof plans])

  function usagePercent(used: number, limit: number): number {
    if (limit === 0) return 0
    return Math.min(100, Math.round((used / limit) * 100))
  }

  function barColor(percent: number): string {
    if (percent >= 100) return 'bg-err-400'
    if (percent >= 95) return 'bg-err-400'
    if (percent >= 80) return 'bg-yellow-400'
    return 'bg-accent-500'
  }

  function statusBadge(percent: number): { label: string; class: string } {
    if (percent >= 100) return { label: 'Blocked', class: 'bg-err-400/20 text-err-400' }
    if (percent >= 95) return { label: 'Critical', class: 'bg-err-400/20 text-err-400' }
    if (percent >= 80) return { label: 'Warning', class: 'bg-yellow-400/20 text-yellow-400' }
    return { label: 'OK', class: 'bg-green-400/20 text-green-400' }
  }

  const ciPercent = $derived(usage && plan ? usagePercent(usage.ciMinutesUsed, plan.ciMinutesLimit) : 0)
  const storagePercent = $derived(usage && plan ? usagePercent(usage.storageBytes, plan.storageLimitGb * 1024 * 1024 * 1024) : 0)

  const overallStatus = $derived(statusBadge(Math.max(ciPercent, storagePercent)))

  const spendingCap = $derived(plan?.spendingCapEur ?? 0)
  const blocks = $derived(Math.floor(spendingCap / BLOCK_PRICE))
  const extraCiMinutes = $derived(blocks * 10_000)
  const extraStorageGb = $derived(blocks * 10)

  let editingReceiptEmail = $state(false)
  let receiptEmailValue = $state(plan?.receiptEmail ?? '')
  let changingPlan = $state(false)
  let spendingCapInput = $state(plan?.spendingCapEur ?? 0)
  let receiptEmailSaved = $state(false)
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-surface-200">Subscription</h2>
    <span class="text-xs px-2 py-0.5 rounded-full {overallStatus.class}">{overallStatus.label}</span>
  </div>

  {#if form?.error}
    <div class="mb-4 px-3 py-2 rounded-md bg-err-400/10 text-err-400 text-sm">
      <p>{form.error}</p>
      {#if 'violations' in form && Array.isArray(form.violations)}
        <ul class="list-disc list-inside text-xs space-y-0.5 mt-1">
          {#each form.violations as v}
            <li>{v}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
  {#if form?.planChanged}
    <div class="mb-4 px-3 py-2 rounded-md bg-green-400/10 text-green-400 text-sm">Plan updated</div>
  {/if}
  {#if form?.updated}
    <div class="mb-4 px-3 py-2 rounded-md bg-green-400/10 text-green-400 text-sm">Settings saved</div>
  {/if}

  <div class="max-w-2xl space-y-6">
    <!-- Current Plan -->
    <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
      <div class="flex items-center justify-between mb-1">
        <p class="text-sm text-surface-300">Current Plan</p>
        <div class="flex items-center gap-2">
          {#if plan?.aiEnabled}
            <span class="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full">AI</span>
          {/if}
          <span class="text-xs bg-accent-600/20 text-accent-400 px-2 py-0.5 rounded-full">{currentPlan.label}</span>
        </div>
      </div>
      <p class="text-2xl font-semibold text-surface-200">{currentPlan.price}</p>
      <p class="text-xs text-surface-600 mt-1">{currentPlan.description}</p>
    </div>

    <!-- Plan Selector -->
    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Change Plan</p>
      <div class="grid grid-cols-3 gap-3">
        {#each Object.entries(plans) as [key, p]}
          {@const isActive = (plan?.plan ?? 'personal') === key}
          <form
            method="POST"
            action="?/changePlan"
            use:enhance={() => {
              changingPlan = true
              return async ({ update }) => {
                changingPlan = false
                await update({ invalidateAll: true })
              }
            }}
          >
            <input type="hidden" name="plan" value={key} />
            <button
              type="submit"
              disabled={isActive || changingPlan}
              class="w-full text-left bg-surface-900 border rounded-lg p-3 transition-colors
                {isActive ? 'border-accent-500 ring-1 ring-accent-500/30' : 'border-surface-800 hover:border-surface-600'}
                disabled:cursor-default disabled:opacity-60"
            >
              <p class="text-sm font-medium {isActive ? 'text-accent-400' : 'text-surface-300'}">{p.label}</p>
              <p class="text-lg font-semibold text-surface-200 mt-1">{p.price}</p>
              <p class="text-[11px] text-surface-600 mt-1">{p.description}</p>
            </button>
          </form>
        {/each}
      </div>
      <p class="text-[10px] text-surface-600 mt-2">Payment integration coming soon. Plan changes take effect immediately.</p>
    </div>

    <!-- Spending Cap (Team plan only) -->
    {#if plan?.plan === 'team'}
    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Spending Cap</p>
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-sm text-surface-300">Maximum additional spend per month</p>
            <p class="text-[11px] text-surface-600">Every €{BLOCK_PRICE} adds 10,000 CI minutes + 10 GB storage</p>
          </div>
          <span class="text-lg font-semibold text-surface-200 font-mono">€{spendingCap}</span>
        </div>

        {#if blocks > 0}
          <div class="text-[11px] text-surface-500 mb-3 bg-surface-950 rounded px-2 py-1.5">
            €{spendingCap} = {blocks} {blocks === 1 ? 'block' : 'blocks'} → +{extraCiMinutes.toLocaleString()} CI min, +{extraStorageGb} GB storage
          </div>
        {/if}

        <form
          method="POST"
          action="?/updateSpendingCap"
          class="flex items-center gap-2"
          use:enhance={() => {
            return async ({ update }) => {
              await update({ invalidateAll: true })
            }
          }}
        >
          <label class="text-xs text-surface-500">Cap (EUR):</label>
          <input
            type="number"
            name="spendingCapEur"
            min="0"
            step="1"
            bind:value={spendingCapInput}
            class="w-24 bg-surface-950 border border-surface-700 rounded px-2 py-1 text-xs text-surface-300 font-mono focus:border-surface-500 focus:outline-none"
          />
          <button type="submit" class="text-xs bg-accent-600 hover:bg-accent-500 text-white px-3 py-1 rounded">Update</button>
          {#if spendingCapInput > 0}
            <span class="text-[10px] text-surface-600">
              = {Math.floor(spendingCapInput / BLOCK_PRICE)} {Math.floor(spendingCapInput / BLOCK_PRICE) === 1 ? 'block' : 'blocks'}
            </span>
          {/if}
        </form>
      </div>
    </div>
    {/if}

    <!-- Usage -->
    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Usage</p>
      <div class="space-y-4">
        <!-- CI Minutes -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-surface-400">CI Minutes</span>
            <span class="text-surface-500">
              {usage ? usage.ciMinutesUsed.toLocaleString() : '—'} / {plan ? plan.ciMinutesLimit.toLocaleString() : '—'}
            </span>
          </div>
          <div class="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all {barColor(ciPercent)}" style="width: {ciPercent}%"></div>
          </div>
          {#if ciPercent >= 80}
            <p class="text-[10px] mt-1 {ciPercent >= 100 ? 'text-err-400' : 'text-yellow-400'}">
              {ciPercent >= 100 ? (plan?.plan === 'team' ? 'Pipelines blocked — increase spending cap' : 'Pipelines blocked — upgrade to Team') : `${ciPercent}% used — approaching limit`}
            </p>
          {/if}
        </div>

        <!-- Storage -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-surface-400">Storage</span>
            <span class="text-surface-500">
              {usage ? formatSize(usage.storageBytes) : '—'} / {plan ? plan.storageLimitGb : '—'} GB
            </span>
          </div>
          <div class="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all {barColor(storagePercent)}" style="width: {storagePercent}%"></div>
          </div>
          {#if storagePercent >= 80}
            <p class="text-[10px] mt-1 {storagePercent >= 100 ? 'text-err-400' : 'text-yellow-400'}">
              {storagePercent >= 100 ? (plan?.plan === 'team' ? 'Storage full — increase spending cap' : 'Storage full — upgrade to Team') : `${storagePercent}% used — approaching limit`}
            </p>
          {/if}
        </div>

        <!-- AI -->
        <div class="flex justify-between text-xs">
          <span class="text-surface-400">AI</span>
          {#if plan?.aiEnabled}
            <span class="text-violet-400">Enabled</span>
          {:else}
            <span class="text-surface-600">Not included — upgrade to Starter or Team</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Receipts -->
    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Receipts</p>
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 space-y-3">
        <div class="flex justify-between items-center text-sm">
          <span class="text-surface-500">Receipt email</span>
          {#if editingReceiptEmail}
            <form
              method="POST"
              action="?/updateReceiptEmail"
              class="flex items-center gap-2"
              use:enhance={() => {
                return async ({ result, update }) => {
                  await update({ invalidateAll: true })
                  if (result.type === 'success') {
                    editingReceiptEmail = false
                    receiptEmailSaved = true
                    setTimeout(() => { receiptEmailSaved = false }, 3000)
                  }
                }
              }}
            >
              <input
                type="email"
                name="receiptEmail"
                bind:value={receiptEmailValue}
                class="bg-surface-950 border border-surface-700 rounded px-2 py-1 text-xs text-surface-300 font-mono focus:border-surface-500 focus:outline-none w-56"
              />
              <button type="submit" class="text-xs text-accent-400 hover:text-accent-300">Save</button>
              <button type="button" onclick={() => { editingReceiptEmail = false }} class="text-xs text-surface-500 hover:text-surface-400">Cancel</button>
            </form>
          {:else}
            <div class="flex items-center gap-2">
              <span class="text-surface-300 font-mono text-xs">{plan?.receiptEmail ?? 'Not set'}</span>
              {#if receiptEmailSaved}
                <span class="text-[10px] text-green-400">Saved</span>
              {/if}
              <button onclick={() => { editingReceiptEmail = true; receiptEmailValue = plan?.receiptEmail ?? '' }} class="text-xs text-surface-500 hover:text-surface-300">Edit</button>
            </div>
          {/if}
        </div>
        <p class="text-[10px] text-surface-600">Receipts are sent to this email after each payment. This is not an invoice.</p>

        {#if data.receipts && data.receipts.length > 0}
          <div class="border-t border-surface-800 pt-3 mt-3">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-surface-500 text-left">
                  <th class="pb-2 font-normal">Date</th>
                  <th class="pb-2 font-normal">Period</th>
                  <th class="pb-2 font-normal">Amount</th>
                  <th class="pb-2 font-normal text-right">Download</th>
                </tr>
              </thead>
              <tbody>
                {#each data.receipts as receipt}
                  <tr class="border-t border-surface-800/50">
                    <td class="py-2 text-surface-300">{new Date(receipt.createdAt).toLocaleDateString('en-SE')}</td>
                    <td class="py-2 text-surface-300">{receipt.month}</td>
                    <td class="py-2 text-surface-300">€{receipt.amountEur}</td>
                    <td class="py-2 text-right">
                      <a href="/api/orgs/{data.plan?.orgId}/receipts/{receipt.id}/pdf" target="_blank" class="text-accent-400 hover:text-accent-300">PDF</a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-[11px] text-surface-600 border-t border-surface-800 pt-3">No receipts yet</p>
        {/if}
      </div>
    </div>
  </div>
</div>
