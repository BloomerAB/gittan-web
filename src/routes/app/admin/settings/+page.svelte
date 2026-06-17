<script lang="ts">
  let { data } = $props()

  let orgName = $state(data.orgs?.find((o: any) => o.id === data.activeOrgId)?.displayName ?? '')
  let allowLatest = $state(false)
  let publicRepos = $state(false)
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Organization Settings</h2>

  <div class="max-w-xl space-y-6">
    <div>
      <label class="block text-xs text-surface-500 mb-1">Organization Name</label>
      <input
        type="text"
        bind:value={orgName}
        class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
      />
    </div>

    <div>
      <label class="block text-xs text-surface-500 mb-1">Image Tag Format</label>
      <div class="bg-surface-900 border border-surface-800 rounded-md px-3 py-2">
        <code class="text-sm text-surface-400 font-mono">YYYYMMDD-HHMMSS-sha</code>
      </div>
      <p class="text-[11px] text-surface-600 mt-1">
        All container images are tagged with a timestamp and commit SHA. This format is enforced.
      </p>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-surface-300">Allow <code class="font-mono text-xs">latest</code> tag</p>
        <p class="text-xs text-err-400">Not recommended. Breaks reproducibility and rollback guarantees.</p>
      </div>
      <button
        onclick={() => { allowLatest = !allowLatest }}
        class="relative w-11 h-6 rounded-full transition-colors {allowLatest
          ? 'bg-err-400'
          : 'bg-surface-800'}"
      >
        <span
          class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {allowLatest
            ? 'translate-x-5'
            : ''}"
        ></span>
      </button>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-surface-300">Public repositories</p>
        <p class="text-xs text-surface-600">Allow teams to create publicly visible repositories</p>
      </div>
      <button
        onclick={() => { publicRepos = !publicRepos }}
        class="relative w-11 h-6 rounded-full transition-colors {publicRepos
          ? 'bg-accent-600'
          : 'bg-surface-800'}"
      >
        <span
          class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {publicRepos
            ? 'translate-x-5'
            : ''}"
        ></span>
      </button>
    </div>

    <div class="pt-4 border-t border-surface-800">
      <button class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
        Save Settings
      </button>
    </div>
  </div>
</div>
