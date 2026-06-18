<script lang="ts">
  import { enhance } from '$app/forms'

  let { data, form } = $props()

  let displayName = $state('')
  let submitting = $state(false)
</script>

{#if data.needsOnboarding}
  <div class="min-h-[80vh] flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-surface-200 mb-2">Welcome to Gittan</h1>
        <p class="text-surface-500">Create your organization to get started.</p>
      </div>

      <div class="bg-surface-900 border border-surface-800 rounded-lg p-6">
        {#if form?.error}
          <div class="mb-4 p-3 rounded-md bg-red-900/30 border border-red-800 text-red-400 text-sm">
            {form.error}
          </div>
        {/if}

        <form
          method="POST"
          action="?/createOrg"
          use:enhance={() => {
            submitting = true
            return async ({ update }) => {
              submitting = false
              await update()
            }
          }}
          class="space-y-4"
        >
          <div>
            <label for="displayName" class="block text-xs text-surface-400 mb-1">Organization name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              bind:value={displayName}
              placeholder="Acme Engineering"
              required
              class="w-full bg-surface-800 border border-surface-700 rounded-md px-3 py-2 text-surface-200 placeholder-surface-600 focus:outline-none focus:border-accent-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !displayName}
            class="w-full bg-accent-600 hover:bg-accent-500 text-surface-950 font-medium py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create organization'}
          </button>
        </form>
      </div>
    </div>
  </div>
{:else}
  <div class="p-6 text-surface-500">No teams yet. Go to Admin to create your first team.</div>
{/if}
