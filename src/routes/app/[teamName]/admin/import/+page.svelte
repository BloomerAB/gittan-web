<script lang="ts">
  import { enhance } from '$app/forms'

  let { data, form } = $props()

  let migrating = $state(false)
  let githubUrls = $state('')
  let githubToken = $state('')
  let updateExisting = $state(false)

  type TResult = {
    readonly name: string
    readonly status: 'success' | 'updated' | 'error'
    readonly error?: string
  }
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-1">Import from GitHub</h2>
  <p class="text-sm text-surface-500 mb-6">
    Migrate repositories into <span class="text-surface-300 font-medium">{data.team?.displayName ?? 'this team'}</span> with full git history, branches, and tags.
  </p>

  {#if form?.error}
    <div class="mb-4 px-3 py-2 rounded-md bg-err-400/10 text-err-400 text-sm">{form.error}</div>
  {/if}

  {#if form?.results}
    {@const results = form.results as TResult[]}
    <div class="mb-4 space-y-1">
      {#if form.succeeded === form.total}
        <div class="px-3 py-2 rounded-md bg-green-400/10 text-green-400 text-sm">
          {form.total === 1 ? 'Repository' : `All ${form.total} repositories`} imported successfully.
        </div>
      {:else}
        <div class="px-3 py-2 rounded-md bg-yellow-400/10 text-yellow-400 text-sm">
          {form.succeeded}/{form.total} imported.
        </div>
      {/if}
      {#each results as result}
        <div class="flex items-center gap-2 px-3 py-1.5 text-sm">
          {#if result.status === 'error'}
            <span class="text-err-400">&#10005;</span>
            <span class="font-mono text-surface-400">{result.name}</span>
            <span class="text-err-400/70 text-xs">{result.error}</span>
          {:else}
            <span class="text-green-400">&#10003;</span>
            <a href="/app/{form.teamName}/{result.name}" class="font-mono text-surface-300 hover:text-accent-400">{result.name}</a>
            {#if result.status === 'updated'}
              <span class="text-yellow-400/70 text-xs">(updated)</span>
            {/if}
          {/if}
        </div>
      {/each}
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
          if (result.type === 'success') githubUrls = ''
        }
      }}
    >
      <div class="space-y-4">
        <div>
          <label for="githubUrls" class="block text-xs text-surface-400 mb-1">GitHub Repository URLs</label>
          <textarea
            id="githubUrls"
            name="githubUrls"
            bind:value={githubUrls}
            placeholder={"https://github.com/owner/repo-1\nhttps://github.com/owner/repo-2"}
            required
            rows={4}
            class="w-full bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 font-mono focus:border-accent-500 focus:outline-none resize-y"
          ></textarea>
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

        <label class="flex items-center gap-2 text-sm text-surface-400 cursor-pointer">
          <input
            type="checkbox"
            name="update"
            value="true"
            bind:checked={updateExisting}
            class="accent-accent-500"
          />
          Update if repo already exists
        </label>

        <button
          type="submit"
          disabled={migrating || !githubUrls.trim() || !githubToken}
          class="w-full bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
        >
          {#if migrating}
            Importing...
          {:else}
            Import
          {/if}
        </button>
      </div>
    </form>

    <div class="border-t border-surface-800 pt-4">
      <p class="text-[11px] text-surface-600">
        One URL per line. Clones all branches, tags, and commit history. Issues and pull requests are not migrated.
      </p>
    </div>
  </div>
</div>
