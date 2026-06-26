<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let orgName = $state(data.org?.displayName ?? '')
  let allowLatest = $state(data.org?.allowLatest ?? false)
  let pipelineScope = $state(data.org?.pipelineScope ?? 'org')
  let saving = $state(false)

  $effect(() => {
    orgName = data.org?.displayName ?? ''
    allowLatest = data.org?.allowLatest ?? false
    pipelineScope = data.org?.pipelineScope ?? 'org'
  })
</script>

<div>
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Organization Settings</h2>

  {#if !data.org}
    <p class="text-sm text-surface-500">No organization selected.</p>
  {:else}
    <form
      method="POST"
      action="?/saveSettings"
      use:enhance={() => {
        saving = true
        return async ({ result, update }) => {
          saving = false
          await update()
          if (result.type === 'success') {
            await invalidateAll()
          }
        }
      }}
    >
      <div class="max-w-xl space-y-6">
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="displayName">Organization Name</label>
          <input
            id="displayName"
            name="displayName"
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
          <input type="hidden" name="allowLatest" value={allowLatest ? 'true' : 'false'} />
          <button
            type="button"
            aria-label="Toggle allow latest tag"
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

        <div>
          <p class="text-sm text-surface-300 mb-2">Pipeline scope</p>
          <p class="text-xs text-surface-600 mb-3">
            Choose whether pipeline steps and policies are managed at the organization level or per team.
          </p>
          <input type="hidden" name="pipelineScope" value={pipelineScope} />
          <div class="flex gap-2">
            <button
              type="button"
              onclick={() => { pipelineScope = 'org' }}
              class="px-3 py-1.5 rounded text-sm transition-colors {pipelineScope === 'org'
                ? 'bg-accent-600 text-white'
                : 'bg-surface-900 text-surface-500 hover:text-surface-300'}"
            >
              Organization
            </button>
            <button
              type="button"
              onclick={() => { pipelineScope = 'team' }}
              class="px-3 py-1.5 rounded text-sm transition-colors {pipelineScope === 'team'
                ? 'bg-accent-600 text-white'
                : 'bg-surface-900 text-surface-500 hover:text-surface-300'}"
            >
              Per team
            </button>
          </div>
        </div>

        <div class="pt-4 border-t border-surface-800">
          <button
            type="submit"
            disabled={saving}
            class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {#if form?.saved}
            <p class="text-xs text-ok-400 mt-2">Settings saved.</p>
          {:else if form?.error}
            <p class="text-xs text-err-400 mt-2">{form.error}</p>
          {/if}
        </div>
      </div>
    </form>
  {/if}
</div>
