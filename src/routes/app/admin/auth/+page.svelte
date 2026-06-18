<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let selfRegistration = $state(data.org?.selfRegistration ?? false)
  let emailVerification = $state(data.org?.emailVerification ?? true)
  let saving = $state(false)

  $effect(() => {
    selfRegistration = data.org?.selfRegistration ?? false
    emailVerification = data.org?.emailVerification ?? true
  })
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Authentication</h2>

  {#if !data.org}
    <p class="text-sm text-surface-500">No organization selected.</p>
  {:else}
    <form
      method="POST"
      action="?/saveAuth"
      use:enhance={() => {
        saving = true
        return async ({ result, update }) => {
          saving = false
          await update()
          if (result.type === 'success') await invalidateAll()
        }
      }}
    >
      <div class="max-w-xl space-y-6">
        <p class="text-xs text-surface-600 mb-2">
          Built-in email/password authentication. For SSO via OIDC, configure your identity provider under
          <a href="/app/admin/integrations" class="text-accent-400 hover:text-accent-300">Integrations</a>.
        </p>

        <input type="hidden" name="selfRegistration" value={selfRegistration ? 'true' : 'false'} />
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-surface-300">Self-registration</p>
            <p class="text-xs text-surface-600">Allow users to create accounts without an invitation</p>
          </div>
          <button
            type="button"
            onclick={() => { selfRegistration = !selfRegistration }}
            class="relative w-11 h-6 rounded-full transition-colors {selfRegistration
              ? 'bg-accent-600'
              : 'bg-surface-800'}"
            aria-label="Toggle self-registration"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {selfRegistration
                ? 'translate-x-5'
                : ''}"
            ></span>
          </button>
        </div>

        <input type="hidden" name="emailVerification" value={emailVerification ? 'true' : 'false'} />
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-surface-300">Email verification</p>
            <p class="text-xs text-surface-600">Require email verification before account activation</p>
          </div>
          <button
            type="button"
            onclick={() => { emailVerification = !emailVerification }}
            class="relative w-11 h-6 rounded-full transition-colors {emailVerification
              ? 'bg-accent-600'
              : 'bg-surface-800'}"
            aria-label="Toggle email verification"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {emailVerification
                ? 'translate-x-5'
                : ''}"
            ></span>
          </button>
        </div>

        <div class="pt-4 border-t border-surface-800">
          <button
            type="submit"
            disabled={saving}
            class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {#if form?.saved}
            <span class="text-xs text-ok-400 ml-3">Saved.</span>
          {:else if form?.error}
            <span class="text-xs text-err-400 ml-3">{form.error}</span>
          {/if}
        </div>
      </div>
    </form>
  {/if}
</div>
