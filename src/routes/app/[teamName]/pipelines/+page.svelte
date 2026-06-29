<script lang="ts">
  import { page } from '$app/state'
  import StatusDot from '$lib/components/StatusDot.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import { timeAgo } from '$lib/types'
  import type { TRepo } from '$lib/types'

  type TPipelineRunSummary = {
    readonly runId: string
    readonly repoId: string
    readonly branch: string
    readonly status: string
    readonly startedAt: string
  }

  let { data } = $props()

  let teamNotFound = $derived(data.teamNotFound ?? false)
  let pipelines = $derived((data.pipelines ?? []) as TPipelineRunSummary[])
  let repoMap = $derived((data.repoMap ?? {}) as Record<string, TRepo>)

  let sortedPipelines = $derived(
    [...pipelines].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
  )

  function getRepoName(repoId: string): string {
    return repoMap[repoId]?.name ?? repoId
  }

  function getTeamName(): string {
    return page.params.teamName
  }

  function statusToDot(status: string): 'passed' | 'failed' | 'running' {
    if (status === 'passed') return 'passed'
    if (status === 'failed') return 'failed'
    return 'running'
  }
</script>

{#if teamNotFound}
  <EmptyState title="Team not found" />
{:else if sortedPipelines.length === 0}
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
