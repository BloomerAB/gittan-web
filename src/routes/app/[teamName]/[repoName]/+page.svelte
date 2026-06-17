<script lang="ts">
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import type { TFileEntry, TBranch, TCommit } from '$lib/types'
  import { timeAgo } from '$lib/types'

  let { data }: { data: any } = $props()

  let entries = $derived((data.entries ?? []) as TFileEntry[])
  let branches = $derived((data.branches ?? []) as TBranch[])
  let commits = $derived((data.commits ?? []) as TCommit[])
  let currentRef = $derived((data.currentRef ?? 'main') as string)
  let currentPath = $derived((data.currentPath ?? '') as string)
  let repo = $derived(data.repo)
  let team = $derived(data.team)

  let branchOpen = $state(false)
  let fileContent = $state<string | null>(null)
  let selectedLines = $state<{ start: number; end: number } | null>(null)
  let copied = $state(false)

  let cloneUrl = $derived(`git@gittan.eu:${repo.forgejoFullName}.git`)

  let sortedEntries = $derived(
    [...entries].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    }),
  )

  let pathParts = $derived(
    currentPath ? currentPath.split('/').filter(Boolean) : [],
  )

  let latestCommit = $derived(commits[0] ?? null)

  let basePath = $derived(`/app/${team.name}/${repo.name}`)

  function nameHash(name: string): number {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }

  function avatarHue(name: string): number {
    return nameHash(name) % 360
  }

  function navigateToEntry(entry: TFileEntry): void {
    const ref = currentRef !== 'main' ? `?ref=${currentRef}` : ''
    if (entry.type === 'dir') {
      goto(`${basePath}/code/${entry.path}${ref}`)
    } else {
      goto(`${basePath}/code/${entry.path}${ref}`)
    }
  }

  function selectBranch(branch: string): void {
    branchOpen = false
    const pathSuffix = currentPath ? `/code/${currentPath}` : ''
    const ref = branch !== 'main' ? `?ref=${branch}` : ''
    goto(`${basePath}${pathSuffix}${ref}`)
  }

  async function copyCloneUrl(): Promise<void> {
    await navigator.clipboard.writeText(cloneUrl)
    copied = true
    setTimeout(() => { copied = false }, 2000)
  }

  function parseLineSelection(hash: string): { start: number; end: number } | null {
    const match = hash.match(/^#L(\d+)(?:-L(\d+))?$/)
    if (!match) return null
    const start = parseInt(match[1], 10)
    const end = match[2] ? parseInt(match[2], 10) : start
    return { start, end }
  }

  $effect(() => {
    selectedLines = parseLineSelection(page.url.hash)
  })
</script>

<div>
  <div class="flex items-center gap-3 mb-4">
    <div class="relative">
      <button
        onclick={() => { branchOpen = !branchOpen }}
        class="flex items-center gap-2 px-3 py-1.5 text-sm bg-surface-900 border border-surface-800 rounded-md text-surface-300 hover:border-surface-700 transition-colors"
      >
        <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        {currentRef}
        <svg class="w-3 h-3 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {#if branchOpen}
        <div class="absolute top-full left-0 mt-1 w-48 bg-surface-900 border border-surface-800 rounded-md shadow-lg z-10">
          {#each branches as branch}
            <button
              onclick={() => selectBranch(branch.name)}
              class="block w-full text-left px-3 py-2 text-sm transition-colors {branch.name === currentRef
                ? 'text-white bg-surface-800'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'}"
            >
              {branch.name}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    {#if pathParts.length > 0}
      <div class="flex items-center gap-1 text-sm">
        <a href={basePath} class="text-accent-400 hover:text-accent-500 transition-colors">{repo.name}</a>
        {#each pathParts as part, i}
          <span class="text-surface-700">/</span>
          {#if i < pathParts.length - 1}
            {@const partPath = pathParts.slice(0, i + 1).join('/')}
            <a
              href="{basePath}/code/{partPath}{currentRef !== 'main' ? `?ref=${currentRef}` : ''}"
              class="text-accent-400 hover:text-accent-500 transition-colors"
            >{part}</a>
          {:else}
            <span class="text-white">{part}</span>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-2 mb-4 px-3 py-2 bg-surface-900 border border-surface-800 rounded-md">
    <span class="text-xs text-surface-500 font-mono flex-1 truncate">{cloneUrl}</span>
    <button
      onclick={copyCloneUrl}
      class="text-xs text-surface-400 hover:text-surface-200 transition-colors px-2 py-1"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  </div>

  {#if fileContent !== null}
    <div class="bg-surface-900 border border-surface-800 rounded-lg overflow-hidden">
      <pre class="text-sm font-mono p-4 overflow-x-auto"><code>{#each fileContent.split('\n') as line, i}{@const lineNum = i + 1}{@const isSelected = selectedLines && lineNum >= selectedLines.start && lineNum <= selectedLines.end}<span class="inline-block w-10 text-right pr-4 select-none {isSelected ? 'text-accent-400' : 'text-surface-600'}">{lineNum}</span><span class="{isSelected ? 'bg-accent-400/10' : ''}">{line}</span>
{/each}</code></pre>
    </div>
  {:else}
    {#if latestCommit}
      <div class="flex items-center gap-3 px-4 py-2.5 bg-surface-900 border border-surface-800 rounded-t-lg border-b-0">
        <div
          class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
          style="background: oklch(0.5 0.1 {avatarHue(latestCommit.author)})"
        >
          {latestCommit.author.charAt(0).toUpperCase()}
        </div>
        <span class="text-sm text-surface-300 truncate flex-1">{latestCommit.message}</span>
        <span class="text-xs text-surface-600 font-mono">{latestCommit.sha.slice(0, 7)}</span>
        <span class="text-xs text-surface-600">{timeAgo(latestCommit.timestamp)}</span>
      </div>
    {/if}

    <div class="border border-surface-800 {latestCommit ? 'rounded-b-lg' : 'rounded-lg'}">
      {#each sortedEntries as entry, i}
        <button
          onclick={() => navigateToEntry(entry)}
          class="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-surface-900 transition-colors {i < sortedEntries.length - 1 ? 'border-b border-surface-800/50' : ''}"
        >
          {#if entry.type === 'dir'}
            <svg class="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          {:else}
            <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          {/if}
          <span class="{entry.type === 'dir' ? 'text-surface-300' : 'text-surface-400'}">{entry.name}</span>
        </button>
      {/each}
      {#if sortedEntries.length === 0}
        <div class="px-4 py-8 text-center text-sm text-surface-600">Empty repository</div>
      {/if}
    </div>

    {#if commits.length > 0}
      <div class="mt-6">
        <h3 class="text-xs uppercase text-surface-500 tracking-wider mb-3">Recent Commits</h3>
        <div class="space-y-1">
          {#each commits as commit}
            <div class="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-surface-900 transition-colors">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium text-white shrink-0"
                style="background: oklch(0.5 0.1 {avatarHue(commit.author)})"
              >
                {commit.author.charAt(0).toUpperCase()}
              </div>
              <span class="text-sm text-surface-300 truncate flex-1">{commit.message}</span>
              <span class="text-xs text-surface-600 font-mono shrink-0">{commit.sha.slice(0, 7)}</span>
              <span class="text-xs text-surface-600 shrink-0">{timeAgo(commit.timestamp)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
