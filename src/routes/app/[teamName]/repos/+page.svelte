<script lang="ts">
  import { page } from '$app/state'
  import StatusDot from '$lib/components/StatusDot.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import SkeletonMetrics from '$lib/components/SkeletonMetrics.svelte'
  import SkeletonRow from '$lib/components/SkeletonRow.svelte'
  import MetricCard from '$lib/components/MetricCard.svelte'
  import { timeAgo, formatMs } from '$lib/types'
  import type { TTeam, TRepo, TRepoActivity, TTeamMetrics } from '$lib/types'

  let { data }: { data: any } = $props()

  let team = $derived(
    (data.teams as TTeam[]).find((t) => t.name === page.params.teamName),
  )
  let repos = $derived(team ? (data.reposByTeam[team.id] ?? []) as TRepo[] : [])
  let activity = $derived((data.activity ?? {}) as Record<string, TRepoActivity>)
  let metrics = $derived(data.metrics as TTeamMetrics | null)

  let activeRepos = $derived(
    repos
      .filter((r) => activity[r.id]?.lastCommit)
      .sort((a, b) => {
        const aTs = activity[a.id]?.lastCommit?.timestamp ?? ''
        const bTs = activity[b.id]?.lastCommit?.timestamp ?? ''
        return bTs.localeCompare(aTs)
      }),
  )
  let idleRepos = $derived(repos.filter((r) => !activity[r.id]?.lastCommit))

  type HealthLevel = 'ok' | 'warn' | 'err' | 'neutral'

  function healthBorder(level: HealthLevel): string {
    const borders: Record<HealthLevel, string> = {
      ok: 'border-ok-400/30',
      warn: 'border-yellow-400/30',
      err: 'border-err-400/30',
      neutral: 'border-surface-800',
    }
    return borders[level]
  }

  function pushFreqHealth(freq: number): HealthLevel {
    if (freq >= 5) return 'ok'
    if (freq >= 2) return 'warn'
    return 'err'
  }

  function leadTimeHealth(ms: number): HealthLevel {
    if (ms <= 120_000) return 'ok'
    if (ms <= 300_000) return 'warn'
    return 'err'
  }

  function rejectionHealth(rate: number): HealthLevel {
    if (rate <= 0.1) return 'ok'
    if (rate <= 0.3) return 'warn'
    return 'err'
  }

  function recoveryHealth(ms: number): HealthLevel {
    if (ms === 0) return 'neutral'
    if (ms <= 600_000) return 'ok'
    if (ms <= 1_800_000) return 'warn'
    return 'err'
  }
</script>

{#if !team}
  <EmptyState title="Team not found" />
{:else}
  <div>
    <div class="flex items-center gap-3 mb-4 text-sm text-surface-500">
      {#if team.slackChannel}
        <span>#{team.slackChannel}</span>
        <span class="text-surface-700">|</span>
      {/if}
      <span>{repos.length} {repos.length === 1 ? 'repo' : 'repos'}</span>
    </div>

    {#if !metrics}
      <SkeletonMetrics />
    {:else}
      <div class="grid grid-cols-5 gap-4 mb-6">
        <div class="bg-surface-900 border {healthBorder('neutral')} rounded-lg p-4">
          <p class="text-[11px] uppercase text-surface-500 tracking-wider">Repos</p>
          <p class="text-2xl font-semibold mt-1 text-white">{repos.length}</p>
          <p class="text-[11px] text-surface-600 mt-1">{activeRepos.length} active</p>
        </div>
        <div class="bg-surface-900 border {healthBorder(pushFreqHealth(metrics.pushFrequency))} rounded-lg p-4">
          <p class="text-[11px] uppercase text-surface-500 tracking-wider">Push Freq</p>
          <p class="text-2xl font-semibold mt-1 text-white">{metrics.pushFrequency.toFixed(1)}</p>
          <p class="text-[11px] text-surface-600 mt-1">pushes / day</p>
        </div>
        <div class="bg-surface-900 border {healthBorder(leadTimeHealth(metrics.avgPipelineLeadTimeMs))} rounded-lg p-4">
          <p class="text-[11px] uppercase text-surface-500 tracking-wider">Lead Time</p>
          <p class="text-2xl font-semibold mt-1 text-white">{formatMs(metrics.avgPipelineLeadTimeMs)}</p>
          <p class="text-[11px] text-surface-600 mt-1">avg pipeline</p>
        </div>
        <div class="bg-surface-900 border {healthBorder(rejectionHealth(metrics.pushRejectionRate))} rounded-lg p-4">
          <p class="text-[11px] uppercase text-surface-500 tracking-wider">Rejection</p>
          <p class="text-2xl font-semibold mt-1 text-white">{(metrics.pushRejectionRate * 100).toFixed(0)}%</p>
          <p class="text-[11px] text-surface-600 mt-1">{metrics.failedPushes} of {metrics.totalPushes} pushes</p>
        </div>
        <div class="bg-surface-900 border {healthBorder(recoveryHealth(metrics.avgRecoveryTimeMs))} rounded-lg p-4">
          <p class="text-[11px] uppercase text-surface-500 tracking-wider">Recovery</p>
          <p class="text-2xl font-semibold mt-1 text-white">{metrics.avgRecoveryTimeMs === 0 ? '—' : formatMs(metrics.avgRecoveryTimeMs)}</p>
          <p class="text-[11px] text-surface-600 mt-1">avg time to fix</p>
        </div>
      </div>
    {/if}

    {#if repos.length === 0}
      <EmptyState
        title="No repositories"
        description="Add a repo to this team to get started."
        command="gittan repo create --team {team.name} <repo-name>"
      />
    {:else}
      {#if activeRepos.length > 0}
        <div class="mb-6">
          <h2 class="text-xs uppercase text-surface-500 tracking-wider mb-3">Active Repos</h2>
          <div class="space-y-2">
            {#each activeRepos as repo}
              {@const act = activity[repo.id]}
              {@const commit = act?.lastCommit}
              <a
                href="/app/{team.name}/{repo.name}"
                class="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 hover:border-surface-700 transition-colors"
              >
                <StatusDot status="passed" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-white font-medium">{repo.name}</span>
                    {#if repo.gatedBranches.length > 0}
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-accent-900 text-accent-400">gated</span>
                    {/if}
                  </div>
                  {#if commit}
                    <p class="text-xs text-surface-500 mt-0.5 truncate">
                      <span class="text-surface-600 font-mono">{commit.sha.slice(0, 7)}</span>
                      <span class="mx-1 text-surface-700">—</span>
                      <span>{commit.message}</span>
                      <span class="mx-1 text-surface-700">by</span>
                      <span class="text-surface-400">{commit.author}</span>
                    </p>
                  {/if}
                </div>
                {#if commit}
                  <span class="text-xs text-surface-600 whitespace-nowrap">{timeAgo(commit.timestamp)}</span>
                {/if}
              </a>
            {/each}
          </div>
        </div>
      {/if}

      {#if idleRepos.length > 0}
        <div>
          <h2 class="text-xs uppercase text-surface-500 tracking-wider mb-3">Idle Repos</h2>
          <div class="space-y-2">
            {#each idleRepos as repo}
              <a
                href="/app/{team.name}/{repo.name}"
                class="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 hover:border-surface-700 transition-colors"
              >
                <StatusDot status="idle" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-400">{repo.name}</span>
                    {#if repo.gatedBranches.length > 0}
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-accent-900 text-accent-400">gated</span>
                    {/if}
                  </div>
                  <p class="text-xs text-surface-600 mt-0.5">No activity</p>
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
{/if}
