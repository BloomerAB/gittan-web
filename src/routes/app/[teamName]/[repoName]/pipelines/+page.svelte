<script lang="ts">
  import StatusDot from '$lib/components/StatusDot.svelte'
  import SourceBadge from '$lib/components/SourceBadge.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import { timeAgo, formatMs } from '$lib/types'

  type StepStatus = 'passed' | 'failed' | 'skipped' | 'running'

  type Step = {
    readonly stepName: string
    readonly status: StepStatus
    readonly source?: string
    readonly sourceName?: string
    readonly durationMs: number
    readonly error?: string
  }

  type PipelineRun = {
    readonly id: string
    readonly branch: string
    readonly status: 'passed' | 'failed'
    readonly startedAt: string
    readonly finishedAt: string
    readonly steps: readonly Step[]
  }

  const { data } = $props()
  const runs = $derived((data.runs ?? []) as PipelineRun[])
  const pipelineConfig = $derived(data.pipelineConfig as string | null)
  let showConfig = $state(false)

  const statusIcons: Record<StepStatus, string> = {
    passed: '✓',
    failed: '✗',
    skipped: '⊘',
    running: '⟳',
  }

  const statusColors: Record<StepStatus, string> = {
    passed: 'text-ok-400',
    failed: 'text-err-400',
    skipped: 'text-surface-600',
    running: 'text-yellow-400',
  }

  let expandedRuns = $state<Set<string>>(new Set())
  let expandedErrors = $state<Set<string>>(new Set())

  function toggleRun(id: string): void {
    const next = new Set(expandedRuns)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    expandedRuns = next
  }

  function toggleError(key: string): void {
    const next = new Set(expandedErrors)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    expandedErrors = next
  }

  function runDurationMs(run: PipelineRun): number {
    if (!run.startedAt || !run.finishedAt) return 0
    return new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
  }

  function policyCount(run: PipelineRun): number {
    return run.steps.filter(s => s.source === 'policy').length
  }
</script>

<div>
  {#if pipelineConfig}
    <div class="mb-6">
      <button
        onclick={() => showConfig = !showConfig}
        class="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
      >
        <svg
          class="w-4 h-4 transition-transform {showConfig ? 'rotate-90' : ''}"
          fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span class="font-mono">.gittan.yaml</span>
      </button>
      {#if showConfig}
        <pre class="mt-2 px-4 py-3 text-xs font-mono bg-surface-900 border border-surface-800 rounded-lg text-surface-300 overflow-x-auto">{pipelineConfig}</pre>
      {/if}
    </div>
  {/if}

  {#if runs.length === 0}
    <EmptyState
      title="No pipeline runs"
      description="Push to a gated branch to trigger a pipeline."
    />
  {:else}
    <div class="space-y-3">
      {#each runs as run}
        {@const isExpanded = expandedRuns.has(run.id)}
        {@const duration = runDurationMs(run)}
        <div class="bg-surface-900 border border-surface-800 rounded-lg overflow-hidden">
          <button
            onclick={() => toggleRun(run.id)}
            class="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-surface-800/50 transition-colors"
          >
            <StatusDot status={run.status} />
            <span class="text-xs text-surface-600 font-mono">{run.id.slice(0, 7)}</span>
            <span class="text-sm text-surface-300 truncate flex-1">{run.branch}</span>
            <span class="text-xs text-surface-600">{formatMs(duration)}</span>
            <span class="text-xs text-surface-600">{timeAgo(run.startedAt)}</span>
            <svg
              class="w-4 h-4 text-surface-600 transition-transform {isExpanded ? 'rotate-180' : ''}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {#if isExpanded}
            <div class="border-t border-surface-800 px-4 py-2">
              <div class="flex items-center gap-4 text-xs text-surface-600 mb-3">
                <span>branch: <span class="text-surface-400 font-mono">{run.branch}</span></span>
                <span>{run.steps.length} steps</span>
                <span>{policyCount(run)} policies</span>
              </div>
              <div class="space-y-1">
                {#each run.steps as step}
                  {@const errorKey = `${run.id}-${step.stepName}`}
                  {@const hasError = step.status === 'failed' && !!step.error}
                  <div>
                    <button
                      class="flex items-center gap-3 px-3 py-2 rounded w-full text-left transition-colors {hasError ? 'cursor-pointer hover:bg-surface-800/30' : ''}"
                      onclick={() => hasError && toggleError(errorKey)}
                      disabled={!hasError}
                    >
                      <span class="w-4 text-center {statusColors[step.status as StepStatus]}">{statusIcons[step.status as StepStatus]}</span>
                      {#if step.source}
                        <SourceBadge source={step.source as 'policy' | 'template' | 'repo'} name={step.sourceName} />
                      {/if}
                      <span class="text-sm text-surface-300 flex-1">{step.stepName}</span>
                      {#if step.durationMs > 0}
                        <span class="text-xs text-surface-600">{formatMs(step.durationMs)}</span>
                      {/if}
                    </button>
                    {#if hasError && expandedErrors.has(errorKey)}
                      <pre class="mx-3 mt-1 mb-2 px-3 py-2 text-xs font-mono bg-err-400/5 border border-err-400/20 rounded text-err-300 overflow-x-auto">{step.error}</pre>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
