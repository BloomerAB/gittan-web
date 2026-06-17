<script lang="ts">
  import StatusDot from '$lib/components/StatusDot.svelte'
  import SourceBadge from '$lib/components/SourceBadge.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import { timeAgo, formatMs } from '$lib/types'

  type StepStatus = 'passed' | 'failed' | 'skipped' | 'running'

  type Step = {
    name: string
    status: StepStatus
    source: 'policy' | 'template' | 'repo'
    sourceName?: string
    durationMs: number
    error?: string
  }

  type PipelineRun = {
    id: string
    sha: string
    message: string
    author: string
    branch: string
    status: 'passed' | 'failed'
    timestamp: string
    durationMs: number
    steps: Step[]
    policyCount: number
  }

  const mockRuns: PipelineRun[] = [
    {
      id: 'run-1',
      sha: 'a1b2c3d',
      message: 'feat: add user preferences endpoint',
      author: 'erik',
      branch: 'main',
      status: 'passed',
      timestamp: new Date(Date.now() - 25 * 60_000).toISOString(),
      durationMs: 34_200,
      policyCount: 3,
      steps: [
        { name: 'lint', status: 'passed', source: 'template', sourceName: 'node-default', durationMs: 4_100 },
        { name: 'typecheck', status: 'passed', source: 'template', sourceName: 'node-default', durationMs: 8_300 },
        { name: 'unit-tests', status: 'passed', source: 'repo', durationMs: 12_400 },
        { name: 'no-secrets', status: 'passed', source: 'policy', sourceName: 'security-baseline', durationMs: 1_200 },
        { name: 'image-tag-format', status: 'passed', source: 'policy', sourceName: 'release-standards', durationMs: 800 },
        { name: 'build', status: 'passed', source: 'repo', durationMs: 7_400 },
      ],
    },
    {
      id: 'run-2',
      sha: 'e4f5g6h',
      message: 'fix: correct timezone handling in scheduler',
      author: 'malin',
      branch: 'main',
      status: 'failed',
      timestamp: new Date(Date.now() - 3 * 3600_000).toISOString(),
      durationMs: 18_700,
      policyCount: 3,
      steps: [
        { name: 'lint', status: 'passed', source: 'template', sourceName: 'node-default', durationMs: 3_900 },
        { name: 'typecheck', status: 'passed', source: 'template', sourceName: 'node-default', durationMs: 7_800 },
        { name: 'unit-tests', status: 'failed', source: 'repo', durationMs: 5_200, error: 'FAIL src/scheduler.test.ts\n  SchedulerService > handleTimezone\n    expected "2026-06-17T10:00:00Z" to equal "2026-06-17T08:00:00Z"\n\n    at src/scheduler.test.ts:42:18' },
        { name: 'no-secrets', status: 'passed', source: 'policy', sourceName: 'security-baseline', durationMs: 1_100 },
        { name: 'image-tag-format', status: 'skipped', source: 'policy', sourceName: 'release-standards', durationMs: 0 },
        { name: 'build', status: 'skipped', source: 'repo', durationMs: 0 },
      ],
    },
  ]

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
</script>

<div>
  {#if mockRuns.length === 0}
    <EmptyState
      title="No pipeline runs"
      description="Push to a gated branch to trigger a pipeline."
    />
  {:else}
    <div class="space-y-3">
      {#each mockRuns as run}
        {@const isExpanded = expandedRuns.has(run.id)}
        <div class="bg-surface-900 border border-surface-800 rounded-lg overflow-hidden">
          <button
            onclick={() => toggleRun(run.id)}
            class="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-surface-800/50 transition-colors"
          >
            <StatusDot status={run.status} />
            <span class="text-xs text-surface-600 font-mono">{run.sha}</span>
            <span class="text-sm text-surface-300 truncate flex-1">{run.message}</span>
            <span class="text-xs text-surface-500">{run.author}</span>
            <span class="text-xs text-surface-600">{formatMs(run.durationMs)}</span>
            <span class="text-xs text-surface-600">{timeAgo(run.timestamp)}</span>
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
                <span>{run.policyCount} policies</span>
              </div>
              <div class="space-y-1">
                {#each run.steps as step}
                  {@const errorKey = `${run.id}-${step.name}`}
                  {@const hasError = step.status === 'failed' && !!step.error}
                  <div>
                    <button
                      class="flex items-center gap-3 px-3 py-2 rounded w-full text-left transition-colors {hasError ? 'cursor-pointer hover:bg-surface-800/30' : ''}"
                      onclick={() => hasError && toggleError(errorKey)}
                      disabled={!hasError}
                    >
                      <span class="w-4 text-center {statusColors[step.status]}">{statusIcons[step.status]}</span>
                      <SourceBadge source={step.source} name={step.sourceName} />
                      <span class="text-sm text-surface-300 flex-1">{step.name}</span>
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
