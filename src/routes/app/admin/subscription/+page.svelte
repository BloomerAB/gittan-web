<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import { formatSize } from '$lib/types'

  let { data, form } = $props()

  const plan = $derived(data.plan)
  const usage = $derived(data.usage)

  const plans = {
    personal: { label: 'Personal', price: 'Free', description: '1 user, 1 team, 5 repos, 500 CI min/mo' },
    starter: { label: 'Starter', price: '€29/mo', description: '5 users, 3 teams, 20 repos, 2,000 CI min/mo' },
    team: { label: 'Team', price: '€199/mo', description: 'Unlimited users/teams/repos, 10,000 CI min/mo' },
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
  const usersPercent = $derived(usage && plan && plan.userLimit > 0 ? usagePercent(usage.userCount, plan.userLimit) : 0)
  const teamsPercent = $derived(usage && plan && plan.teamLimit > 0 ? usagePercent(usage.teamCount, plan.teamLimit) : 0)
  const reposPercent = $derived(usage && plan && plan.repoLimit > 0 ? usagePercent(usage.repoCount, plan.repoLimit) : 0)

  const overallStatus = $derived(statusBadge(Math.max(ciPercent, storagePercent, usersPercent, teamsPercent, reposPercent)))

  let editingBillingEmail = $state(false)
  let billingEmailValue = $state(plan?.billingEmail ?? '')
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-surface-200">Subscription</h2>
    <span class="text-xs px-2 py-0.5 rounded-full {overallStatus.class}">{overallStatus.label}</span>
  </div>

  {#if form?.error}
    <div class="mb-4 px-3 py-2 rounded-md bg-err-400/10 text-err-400 text-sm">{form.error}</div>
  {/if}

  <div class="max-w-2xl space-y-6">
    <!-- Current Plan -->
    <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
      <div class="flex items-center justify-between mb-1">
        <p class="text-sm text-surface-300">Current Plan</p>
        <span class="text-xs bg-accent-600/20 text-accent-400 px-2 py-0.5 rounded-full">{currentPlan.label}</span>
      </div>
      <p class="text-2xl font-semibold text-surface-200">{currentPlan.price}</p>
      <p class="text-xs text-surface-600 mt-1">{currentPlan.description}</p>
    </div>

    <!-- Plan Selector -->
    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Change Plan</p>
      <div class="grid grid-cols-3 gap-3">
        {#each Object.entries(plans) as [key, p]}
          {@const isActive = plan?.plan === key}
          <form
            method="POST"
            action="?/changePlan"
            use:enhance={() => {
              return async ({ update }) => {
                await update({ invalidateAll: true })
              }
            }}
          >
            <input type="hidden" name="plan" value={key} />
            <button
              type="submit"
              disabled={isActive}
              class="w-full text-left bg-surface-900 border rounded-lg p-3 transition-colors
                {isActive ? 'border-accent-500 ring-1 ring-accent-500/30' : 'border-surface-800 hover:border-surface-600'}
                disabled:cursor-default"
            >
              <p class="text-sm font-medium {isActive ? 'text-accent-400' : 'text-surface-300'}">{p.label}</p>
              <p class="text-lg font-semibold text-surface-200 mt-1">{p.price}</p>
              <p class="text-[11px] text-surface-600 mt-1">{p.description}</p>
            </button>
          </form>
        {/each}
      </div>
    </div>

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
              {ciPercent >= 100 ? 'Pipelines blocked — upgrade to continue' : `${ciPercent}% used — approaching limit`}
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
        </div>

        <!-- Resource counts -->
        {#if plan && plan.userLimit > 0}
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-surface-400">Members</span>
              <span class="text-surface-500">{usage?.userCount ?? 0} / {plan.userLimit}</span>
            </div>
            <div class="h-2 bg-surface-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all {barColor(usersPercent)}" style="width: {usersPercent}%"></div>
            </div>
          </div>
        {/if}

        {#if plan && plan.teamLimit > 0}
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-surface-400">Teams</span>
              <span class="text-surface-500">{usage?.teamCount ?? 0} / {plan.teamLimit}</span>
            </div>
            <div class="h-2 bg-surface-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all {barColor(teamsPercent)}" style="width: {teamsPercent}%"></div>
            </div>
          </div>
        {/if}

        {#if plan && plan.repoLimit > 0}
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-surface-400">Repositories</span>
              <span class="text-surface-500">{usage?.repoCount ?? 0} / {plan.repoLimit}</span>
            </div>
            <div class="h-2 bg-surface-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all {barColor(reposPercent)}" style="width: {reposPercent}%"></div>
            </div>
          </div>
        {/if}

        {#if plan && plan.userLimit === 0}
          <div class="flex justify-between text-xs">
            <span class="text-surface-400">Members / Teams / Repos</span>
            <span class="text-surface-500">Unlimited</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Billing -->
    <div>
      <p class="text-[11px] uppercase text-surface-500 tracking-wider mb-3">Billing</p>
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 space-y-3">
        <div class="flex justify-between items-center text-sm">
          <span class="text-surface-500">Billing email</span>
          {#if editingBillingEmail}
            <form
              method="POST"
              action="?/updateBillingEmail"
              class="flex items-center gap-2"
              use:enhance={() => {
                return async ({ result, update }) => {
                  await update({ invalidateAll: true })
                  if (result.type === 'success') {
                    editingBillingEmail = false
                  }
                }
              }}
            >
              <input
                type="email"
                name="billingEmail"
                bind:value={billingEmailValue}
                class="bg-surface-950 border border-surface-700 rounded px-2 py-1 text-xs text-surface-300 font-mono focus:border-surface-500 focus:outline-none w-56"
              />
              <button type="submit" class="text-xs text-accent-400 hover:text-accent-300">Save</button>
              <button type="button" onclick={() => { editingBillingEmail = false }} class="text-xs text-surface-500 hover:text-surface-400">Cancel</button>
            </form>
          {:else}
            <div class="flex items-center gap-2">
              <span class="text-surface-300 font-mono text-xs">{plan?.billingEmail ?? 'Not set'}</span>
              <button onclick={() => { editingBillingEmail = true; billingEmailValue = plan?.billingEmail ?? '' }} class="text-xs text-surface-500 hover:text-surface-300">Edit</button>
            </div>
          {/if}
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-surface-500">Payment</span>
          <span class="text-surface-500 text-xs italic">Payment integration coming soon</span>
        </div>
      </div>
    </div>
  </div>
</div>
