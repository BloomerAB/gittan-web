<script lang="ts">
  import { page } from '$app/state'
  import StatusDot from '$lib/components/StatusDot.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import SkeletonMetrics from '$lib/components/SkeletonMetrics.svelte'
  import { timeAgo, formatMs } from '$lib/types'
  import type { TRepo, TTeamMetrics } from '$lib/types'

  type TPipelineRunSummary = {
    readonly runId: string
    readonly repoId: string
    readonly branch: string
    readonly status: string
    readonly startedAt: string
  }

  type HealthLevel = 'ok' | 'warn' | 'err' | 'neutral'

  let { data } = $props()

  let teamNotFound = $derived(data.teamNotFound ?? false)
  let pipelines = $derived((data.pipelines ?? []) as TPipelineRunSummary[])
  let repoMap = $derived((data.repoMap ?? {}) as Record<string, TRepo>)
  let metrics = $derived(data.metrics as TTeamMetrics | null)

  let repos = $derived(Object.values(repoMap))
  let activeRepos = $derived(
    repos
      .filter((r) => data.activity?.[r.id]?.lastCommit)
      .length || 0
  )

  let sortedPipelines = $derived(
    [...pipelines].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
  )

  function getRepoName(repoId: string): string {
    return repoMap[repoId]?.name ?? repoId
  }

  function getTeamName(): string {
    return page.params.teamName ?? ''
  }

  function statusToDot(status: string): 'passed' | 'failed' | 'running' {
    if (status === 'passed') return 'passed'
    if (status === 'failed') return 'failed'
    return 'running'
  }

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

{#if teamNotFound}
  <EmptyState title="Team not found" />
{:else}
  <div>
    {#if !metrics}
      <SkeletonMetrics />
    {:else}
      <div class="grid grid-cols-5 gap-4 mb-6">
        <div class="bg-surface-900 border {healthBorder('neutral')} rounded-lg p-4">
          <p class="text-[11px] uppercase text-surface-500 tracking-wider">Repos</p>
          <p class="text-2xl font-semibold mt-1 text-white">{repos.length}</p>
          <p class="text-[11px] text-surface-600 mt-1">{activeRepos} active</p>
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

    {#if sortedPipelines.length === 0}
      <EmptyState
        title="Team Pipelines"
        description="Aggregated pipeline runs across all repos in this team will appear here."
      />
    {:else}
      <div class="space-y-2">
        {#each sortedPipelines as pipeline}
          {@const repoName = getRepoName(pipeline.repoId)}
          <a
            href="/app/{getTeamName()}/{repoName}/pipelines"
            class="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 hover:border-surface-700 transition-colors"
          >
            <StatusDot status={statusToDot(pipeline.status)} />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm text-white font-medium">{repoName}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-400">{pipeline.branch}</span>
              </div>
              <p class="text-xs text-surface-600 mt-0.5">
                {#if pipeline.status === 'running'}
                  <span class="text-yellow-400">running</span>
                {:else}
                  {pipeline.status}
                {/if}
              </p>
            </div>
            <span class="text-xs text-surface-600 whitespace-nowrap">{timeAgo(pipeline.startedAt)}</span>
          </a>
        {/each}
      </div>
    {/if}
  </div>
{/if}
