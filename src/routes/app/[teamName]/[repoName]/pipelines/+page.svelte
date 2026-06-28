<script lang="ts">
  import { onMount } from 'svelte'
  import StatusDot from '$lib/components/StatusDot.svelte'
  import SourceBadge from '$lib/components/SourceBadge.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import { timeAgo, formatMs } from '$lib/types'

  type StepStatus = 'passed' | 'failed' | 'skipped' | 'running'

  type Step = {
    readonly stepName: string
    readonly description?: string
    readonly status: StepStatus
    readonly source?: string
    readonly sourceName?: string
    readonly durationMs: number
    readonly exitCode?: number
    readonly output?: string
    readonly error?: string
  }

  type PipelineRun = {
    readonly id: string
    readonly branch: string
    readonly commitSha?: string
    readonly commitMessage?: string
    readonly pusher?: string
    readonly status: 'passed' | 'failed' | 'running'
    readonly startedAt: string
    readonly finishedAt: string
    readonly steps: readonly Step[]
  }

  type LiveRun = {
    readonly pushEventId: string
    readonly steps: Step[]
  }

  const { data } = $props()
  let completedRuns = $state((data.runs ?? []) as PipelineRun[])
  const pipelineConfig = $derived(data.pipelineConfig as string | null)
  let showConfig = $state(false)
  let liveRuns = $state<Map<string, LiveRun>>(new Map())
  let sseConnected = $state(false)

  const allRuns = $derived([
    ...[...liveRuns.values()].map((live): PipelineRun => ({
      id: live.pushEventId,
      branch: '',
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: '',
      steps: live.steps,
    })),
    ...completedRuns,
  ])

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

  const failedRunIds = $derived(new Set(allRuns.filter(r => r.status === 'failed').slice(0, 1).map(r => r.id)))
  const liveRunIds = $derived(new Set(allRuns.filter(r => r.status === 'running').map(r => r.id)))
  let expandedRuns = $state<Set<string>>(new Set())
  const effectiveExpandedRuns = $derived(new Set([...failedRunIds, ...liveRunIds, ...expandedRuns]))
  let expandedSteps = $state<Set<string>>(new Set())

  onMount(() => {
    const url = `live?orgId=${encodeURIComponent(data.orgId)}&repoId=${encodeURIComponent(data.repoId)}`
    const es = new EventSource(url)

    es.addEventListener('connected', () => { sseConnected = true })

    es.addEventListener('step', (e) => {
      const step = JSON.parse(e.data) as Step & { pushEventId: string }
      const id = step.pushEventId

      liveRuns = new Map(liveRuns)
      const existing = liveRuns.get(id)
      const updatedStep: Step = {
        stepName: step.stepName,
        description: step.description,
        status: step.status as StepStatus,
        durationMs: step.durationMs,
        exitCode: step.exitCode,
        output: step.output,
        error: step.error,
        source: step.source,
      }

      if (existing) {
        const idx = existing.steps.findIndex(s => s.stepName === step.stepName)
        const newSteps = [...existing.steps]
        if (idx >= 0) {
          newSteps[idx] = updatedStep
        } else {
          newSteps.push(updatedStep)
        }
        liveRuns.set(id, { ...existing, steps: newSteps })
      } else {
        liveRuns.set(id, { pushEventId: id, steps: [updatedStep] })
      }
    })

    es.addEventListener('complete', (e) => {
      const result = JSON.parse(e.data) as PipelineRun & { pushEventId: string }
      const id = result.pushEventId

      liveRuns = new Map(liveRuns)
      liveRuns.delete(id)

      const completed: PipelineRun = {
        id,
        branch: result.branch ?? '',
        commitSha: result.commitSha,
        commitMessage: result.commitMessage,
        pusher: result.pusher,
        status: result.status as 'passed' | 'failed',
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
        steps: result.steps,
      }

      completedRuns = [completed, ...completedRuns.filter(r => r.id !== id)]
    })

    es.onerror = () => { sseConnected = false }

    return () => es.close()
  })

  function toggleRun(id: string): void {
    const next = new Set(expandedRuns)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    expandedRuns = next
  }

  function toggleStep(key: string): void {
    const next = new Set(expandedSteps)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    expandedSteps = next
  }

  function hasDetails(step: Step): boolean {
    return !!(step.error || step.output)
  }

  function commitSha(run: PipelineRun): string {
    const match = run.id.match(/push-([a-f0-9]+)-/)
    return match?.[1]?.slice(0, 7) ?? run.id.slice(0, 7)
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
  {#if sseConnected}
    <div class="mb-4 flex items-center gap-2 text-xs text-surface-500">
      <span class="w-2 h-2 rounded-full bg-ok-400 animate-pulse"></span>
      Live
    </div>
  {/if}

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

  {#if allRuns.length === 0}
    <EmptyState
      title="No pipeline runs"
      description="Push to a gated branch to trigger a pipeline."
    />
  {:else}
    <div class="space-y-3">
      {#each allRuns as run}
        {@const isExpanded = effectiveExpandedRuns.has(run.id)}
        {@const duration = runDurationMs(run)}
        <div class="bg-surface-900 border border-surface-800 rounded-lg overflow-hidden">
          <button
            onclick={() => toggleRun(run.id)}
            class="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-surface-800/50 transition-colors"
          >
            <StatusDot status={run.status} />
            <span class="text-xs text-surface-600 font-mono">{commitSha(run)}</span>
            <span class="text-sm text-surface-300 truncate flex-1">
              {#if run.commitMessage}
                {run.commitMessage.split('\n')[0]}
              {:else}
                {run.branch}
              {/if}
            </span>
            {#if run.status === 'running'}
              <span class="text-xs text-yellow-400 animate-pulse">running</span>
            {:else}
              <span class="text-xs text-surface-600">{formatMs(duration)}</span>
              <span class="text-xs text-surface-600">{timeAgo(run.startedAt)}</span>
            {/if}
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
                <span><span class="text-surface-400 font-mono">{run.branch}</span></span>
                {#if run.pusher}
                  <span>by <span class="text-surface-400">{run.pusher}</span></span>
                {/if}
                <span>{run.steps.length} steps</span>
                {#if policyCount(run) > 0}
                  <span>{policyCount(run)} policies</span>
                {/if}
              </div>
              <div class="space-y-1">
                {#each run.steps as step}
                  {@const stepKey = `${run.id}-${step.stepName}`}
                  {@const expandable = hasDetails(step)}
                  {@const isStepExpanded = expandedSteps.has(stepKey)}
                  <div>
                    <button
                      class="flex items-center gap-3 px-3 py-2 rounded w-full text-left transition-colors {expandable ? 'cursor-pointer hover:bg-surface-800/30' : ''}"
                      onclick={() => expandable && toggleStep(stepKey)}
                      disabled={!expandable}
                    >
                      <span class="w-4 text-center {statusColors[step.status as StepStatus]}">{statusIcons[step.status as StepStatus]}</span>
                      {#if step.source}
                        <SourceBadge source={step.source as 'policy' | 'template' | 'repo'} name={step.sourceName} />
                      {/if}
                      <span class="text-sm text-surface-300 flex-1">
                        {step.stepName}
                        {#if step.description}
                          <span class="text-xs text-surface-600 ml-1">— {step.description}</span>
                        {/if}
                      </span>
                      {#if step.exitCode !== undefined && step.exitCode !== 0}
                        <span class="text-xs text-err-400 font-mono">exit {step.exitCode}</span>
                      {/if}
                      {#if step.durationMs > 0}
                        <span class="text-xs text-surface-600">{formatMs(step.durationMs)}</span>
                      {/if}
                      {#if expandable}
                        <svg
                          class="w-3 h-3 text-surface-600 transition-transform {isStepExpanded ? 'rotate-180' : ''}"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      {/if}
                    </button>
                    {#if isStepExpanded}
                      <div class="mx-3 mt-1 mb-2 space-y-2">
                        {#if step.error}
                          <pre class="px-3 py-2 text-xs font-mono bg-err-400/5 border border-err-400/20 rounded text-err-300 overflow-x-auto whitespace-pre-wrap">{step.error}</pre>
                        {/if}
                        {#if step.output}
                          <pre class="px-3 py-2 text-xs font-mono bg-surface-800/50 border border-surface-700 rounded text-surface-400 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">{step.output}</pre>
                        {/if}
                      </div>
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
