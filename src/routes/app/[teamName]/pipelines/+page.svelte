<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import StatusDot from '$lib/components/StatusDot.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import { timeAgo } from '$lib/types'
  import type { TRepo } from '$lib/types'

  type TRunSummary = {
    runId: string
    repoId: string
    branch: string
    status: string
    startedAt: string
  }

  let { data } = $props()

  let teamNotFound = $derived(data.teamNotFound ?? false)
  let repoMap = $derived((data.repoMap ?? {}) as Record<string, TRepo>)
  let teamId = $derived(data.teamId as string)

  // Latest status per repo, seeded from SSR then updated live via SSE.
  let statusByRepo = $state<Record<string, TRunSummary>>({})
  $effect(() => {
    const seed: Record<string, TRunSummary> = {}
    for (const s of (data.statuses ?? []) as TRunSummary[]) seed[s.repoId] = s
    statusByRepo = seed
  })

  const teamName = $derived(page.params.teamName ?? '')

  const repos = $derived(Object.values(repoMap).sort((a, b) => a.name.localeCompare(b.name)))

  function dot(status: string | undefined): 'passed' | 'failed' | 'running' {
    if (status === 'passed') return 'passed'
    if (status === 'failed') return 'failed'
    return 'running'
  }

  onMount(() => {
    if (!teamId) return
    const es = new EventSource(`live?teamId=${encodeURIComponent(teamId)}`)
    es.addEventListener('complete', (e) => {
      try {
        const r = JSON.parse((e as MessageEvent).data) as {
          repoId: string; status: string; branch?: string; finishedAt?: string; startedAt?: string
        }
        statusByRepo = {
          ...statusByRepo,
          [r.repoId]: {
            runId: '',
            repoId: r.repoId,
            branch: r.branch ?? statusByRepo[r.repoId]?.branch ?? 'main',
            status: r.status,
            startedAt: r.finishedAt ?? r.startedAt ?? new Date().toISOString(),
          },
        }
      } catch { /* ignore */ }
    })
    return () => es.close()
  })
</script>

{#if teamNotFound}
  <EmptyState title="Team not found" />
{:else if repos.length === 0}
  <EmptyState title="No repos" description="This team has no repos yet." />
{:else}
  <div class="space-y-2">
    {#each repos as repo}
      {@const s = statusByRepo[repo.id]}
      <a
        href="/app/{teamName}/{repo.name}/pipelines"
        class="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 hover:border-surface-700 transition-colors"
      >
        {#if s}
          <StatusDot status={dot(s.status)} />
        {:else}
          <span class="w-2 h-2 rounded-full bg-surface-700"></span>
        {/if}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm text-white font-medium">{repo.name}</span>
            {#if s}
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-400">{s.branch}</span>
            {/if}
          </div>
          <p class="text-xs text-surface-600 mt-0.5">
            {#if !s}
              no builds yet
            {:else if s.status === 'running'}
              <span class="text-yellow-400">running</span>
            {:else}
              {s.status}
            {/if}
          </p>
        </div>
        {#if s}
          <span class="text-xs text-surface-600 whitespace-nowrap">{timeAgo(s.startedAt)}</span>
        {/if}
      </a>
    {/each}
  </div>
{/if}
