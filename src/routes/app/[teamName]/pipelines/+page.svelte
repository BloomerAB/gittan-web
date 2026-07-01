<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import StatusDot from '$lib/components/StatusDot.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import { timeAgo } from '$lib/types'

  // One entry per repo the team owns, served by the API (latest run LEFT-JOINed,
  // or "never_run" for repos that have never run a pipeline).
  type TRepoStatus = {
    repoId: string
    repoName: string
    branch: string | null
    status: string
    startedAt: string | null
    runId: string | null
  }

  // Live override delivered over SSE (keyed by repoId).
  type TLive = {
    status: string
    branch: string | null
    startedAt: string | null
  }

  let { data } = $props()

  let teamNotFound = $derived(data.teamNotFound ?? false)
  let teamId = $derived(data.teamId as string)
  let teamName = $derived(page.params.teamName ?? '')

  // Authoritative per-repo list from the API, sorted by repo name.
  let repos = $derived(
    [...((data.statuses ?? []) as TRepoStatus[])].sort((a, b) =>
      a.repoName.localeCompare(b.repoName),
    ),
  )

  // Live status overrides, seeded from the SSR board then updated via SSE.
  let liveByRepo = $state<Record<string, TLive>>({})
  $effect(() => {
    const seed: Record<string, TLive> = {}
    for (const s of (data.statuses ?? []) as TRepoStatus[]) {
      seed[s.repoId] = { status: s.status, branch: s.branch, startedAt: s.startedAt }
    }
    liveByRepo = seed
  })

  function dot(status: string): 'passed' | 'failed' | 'running' | 'pending' {
    if (status === 'passed') return 'passed'
    if (status === 'failed') return 'failed'
    if (status === 'running') return 'running'
    // never_run / unknown → muted, not-yet-run state
    return 'pending'
  }

  onMount(() => {
    if (!teamId) return
    const es = new EventSource(`live?teamId=${encodeURIComponent(teamId)}`)
    es.addEventListener('running', (e) => {
      try {
        const r = JSON.parse((e as MessageEvent).data) as { repoId: string; branch?: string }
        if (!r.repoId) return
        liveByRepo = {
          ...liveByRepo,
          [r.repoId]: {
            status: 'running',
            branch: r.branch ?? liveByRepo[r.repoId]?.branch ?? 'main',
            startedAt: new Date().toISOString(),
          },
        }
      } catch { /* ignore */ }
    })
    es.addEventListener('complete', (e) => {
      try {
        const r = JSON.parse((e as MessageEvent).data) as {
          repoId: string; status: string; branch?: string; finishedAt?: string; startedAt?: string
        }
        if (!r.repoId) return
        liveByRepo = {
          ...liveByRepo,
          [r.repoId]: {
            status: r.status,
            branch: r.branch ?? liveByRepo[r.repoId]?.branch ?? 'main',
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
    {#each repos as repo (repo.repoId)}
      {@const live = liveByRepo[repo.repoId]}
      {@const status = live?.status ?? repo.status}
      {@const branch = live?.branch ?? repo.branch}
      {@const startedAt = live?.startedAt ?? repo.startedAt}
      {@const neverRun = status === 'never_run'}
      <a
        href="/app/{teamName}/{repo.repoName}/pipelines"
        class="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 hover:border-surface-700 transition-colors {neverRun
          ? 'opacity-60'
          : ''}"
      >
        <StatusDot status={dot(status)} />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm text-white font-medium">{repo.repoName}</span>
            {#if !neverRun && branch}
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-400">{branch}</span>
            {/if}
          </div>
          <p class="text-xs text-surface-600 mt-0.5">
            {#if neverRun}
              no runs yet
            {:else if status === 'running'}
              <span class="text-yellow-400">running</span>
            {:else}
              {status}
            {/if}
          </p>
        </div>
        {#if !neverRun && startedAt}
          <span class="text-xs text-surface-600 whitespace-nowrap">{timeAgo(startedAt)}</span>
        {/if}
      </a>
    {/each}
  </div>
{/if}
