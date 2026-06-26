<script lang="ts">
  import { enhance } from '$app/forms'

  let { data, form } = $props()

  let migrating = $state(false)
  let githubUrl = $state('')
  let githubToken = $state('')
  let selectedTeamId = $state('')

  const teams = $derived(data.teams ?? [])
  const selectedTeam = $derived(teams.find((t: any) => t.id === selectedTeamId))

  const repoPreview = $derived(() => {
    if (!githubUrl) return null
    const match = githubUrl.match(/github\.com\/([\w.-]+)\/([\w.-]+)/)
    if (!match) return null
    return { owner: match[1], name: match[2].toLowerCase() }
  })
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-1">Import from GitHub</h2>
  <p class="text-sm text-surface-500 mb-6">Migrate a repository with full git history, branches, and tags.</p>

  {#if form?.error && !('canUpdate' in form)}
    <div class="mb-4 px-3 py-2 rounded-md bg-err-400/10 text-err-400 text-sm">{form.error}</div>
  {/if}

  {#if form && 'canUpdate' in form && form.canUpdate}
    <div class="mb-4 px-3 py-2 rounded-md bg-yellow-400/10 text-yellow-400 text-sm flex items-center justify-between">
      <span>Repository already exists. Update it with latest from GitHub?</span>
      <form
        method="POST"
        action="?/update"
        use:enhance={() => {
          migrating = true
          return async ({ result, update }) => {
            migrating = false
            await update({ reset: false })
            if (result.type === 'success') githubUrl = ''
          }
        }}
      >
        <input type="hidden" name="githubUrl" value={githubUrl} />
        <input type="hidden" name="githubToken" value={githubToken} />
        <input type="hidden" name="teamId" value={selectedTeamId} />
        {#if selectedTeam}
          <input type="hidden" name="teamName" value={selectedTeam.name} />
        {/if}
        <button
          type="submit"
          disabled={migrating}
          class="text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-3 py-1 rounded ml-3"
        >
          {migrating ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  {/if}

  {#if form?.success}
    <div class="mb-4 px-3 py-2 rounded-md bg-green-400/10 text-green-400 text-sm">
      Repository <strong>{form.repoName}</strong> {form.updated ? 'updated' : 'imported'} successfully.
      <a href="/app/{form.teamName}/{form.repoName}" class="underline hover:text-green-300 ml-1">View repo</a>
    </div>
  {/if}

  <div class="max-w-lg space-y-5">
    <form
      method="POST"
      action="?/migrate"
      use:enhance={() => {
        migrating = true
        return async ({ result, update }) => {
          migrating = false
          await update({ reset: false })
          if (result.type === 'success') githubUrl = ''
        }
      }}
    >
      <div class="space-y-4">
        <div>
          <label for="githubUrl" class="block text-xs text-surface-400 mb-1">GitHub Repository URL</label>
          <input
            id="githubUrl"
            name="githubUrl"
            type="url"
            bind:value={githubUrl}
            placeholder="https://github.com/owner/repo"
            required
            class="w-full bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 font-mono focus:border-accent-500 focus:outline-none"
          />
          {#if repoPreview()}
            <p class="text-[11px] text-surface-600 mt-1">
              Will create: <span class="text-surface-400 font-mono">{repoPreview()?.name}</span>
            </p>
          {/if}
        </div>

        <div>
          <label for="githubToken" class="block text-xs text-surface-400 mb-1">GitHub Personal Access Token</label>
          <input
            id="githubToken"
            name="githubToken"
            type="password"
            autocomplete="off"
            data-1p-ignore
            bind:value={githubToken}
            placeholder="ghp_..."
            required
            class="w-full bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 font-mono focus:border-accent-500 focus:outline-none"
          />
          <p class="text-[10px] text-surface-600 mt-1">Needs <code>repo</code> scope for private repos. Token is not stored.</p>
        </div>

        <div>
          <label for="teamId" class="block text-xs text-surface-400 mb-1">Team</label>
          <select
            id="teamId"
            name="teamId"
            bind:value={selectedTeamId}
            required
            class="w-full bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 focus:border-accent-500 focus:outline-none"
          >
            <option value="" disabled>Select a team</option>
            {#each teams as team}
              <option value={team.id}>{team.displayName}</option>
            {/each}
          </select>
          {#if selectedTeam}
            <input type="hidden" name="teamName" value={selectedTeam.name} />
          {/if}
        </div>

        <button
          type="submit"
          disabled={migrating || !githubUrl || !githubToken || !selectedTeamId}
          class="w-full bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
        >
          {#if migrating}
            Importing...
          {:else}
            Import Repository
          {/if}
        </button>
      </div>
    </form>

    <div class="border-t border-surface-800 pt-4">
      <p class="text-[11px] text-surface-600">
        The import clones all branches, tags, and commit history. Issues and pull requests are not migrated.
        After import, configure your CI/CD pipeline in the repo settings.
      </p>
    </div>
  </div>
</div>
