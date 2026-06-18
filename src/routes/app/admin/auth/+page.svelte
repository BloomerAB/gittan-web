<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let mode = $state<'builtin' | 'oidc'>('builtin')

  let selfRegistration = $state(false)
  let emailVerification = $state(true)

  let issuerUrl = $state(data.org?.oidcIssuer ?? '')
  let clientId = $state(data.org?.oidcClientId ?? '')
  let groupsClaim = $state('groups')
  let mandatorySso = $state(false)
  let testStatus = $state<'idle' | 'testing' | 'success' | 'error'>('idle')
  let saving = $state(false)

  $effect(() => {
    issuerUrl = data.org?.oidcIssuer ?? ''
    clientId = data.org?.oidcClientId ?? ''
  })

  function testConnection() {
    if (!issuerUrl || !clientId) return
    testStatus = 'testing'
    setTimeout(() => {
      testStatus = issuerUrl.includes('://') ? 'success' : 'error'
    }, 1500)
  }
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Authentication</h2>

  <div class="flex gap-2 mb-6">
    <button
      type="button"
      onclick={() => { mode = 'builtin' }}
      class="text-sm px-4 py-2 rounded-md transition-colors {mode === 'builtin'
        ? 'bg-accent-600 text-white'
        : 'bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-300'}"
    >
      Built-in Auth
    </button>
    <button
      type="button"
      onclick={() => { mode = 'oidc' }}
      class="text-sm px-4 py-2 rounded-md transition-colors {mode === 'oidc'
        ? 'bg-accent-600 text-white'
        : 'bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-300'}"
    >
      OIDC SSO
    </button>
  </div>

  {#if !data.org}
    <p class="text-sm text-surface-500">No organization selected.</p>
  {:else}
    <form
      method="POST"
      action="?/saveAuth"
      use:enhance={() => {
        saving = true
        return async ({ update }) => {
          saving = false
          await update()
          if (form?.saved) {
            await invalidateAll()
          }
        }
      }}
    >
      <div class="max-w-xl space-y-6">
        {#if mode === 'builtin'}
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
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {selfRegistration
                  ? 'translate-x-5'
                  : ''}"
              ></span>
            </button>
          </div>

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
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {emailVerification
                  ? 'translate-x-5'
                  : ''}"
              ></span>
            </button>
          </div>
        {:else}
          <div>
            <label class="block text-xs text-surface-500 mb-1" for="oidcIssuer">Issuer URL</label>
            <input
              id="oidcIssuer"
              name="oidcIssuer"
              type="url"
              bind:value={issuerUrl}
              placeholder="https://login.example.com/realms/org"
              class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs text-surface-500 mb-1" for="oidcClientId">Client ID</label>
            <input
              id="oidcClientId"
              name="oidcClientId"
              type="text"
              bind:value={clientId}
              placeholder="gittan-web"
              class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label class="block text-xs text-surface-500 mb-1" for="groupsClaim">Groups Claim</label>
            <input
              id="groupsClaim"
              name="groupsClaim"
              type="text"
              bind:value={groupsClaim}
              placeholder="groups"
              class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
            />
            <p class="text-[11px] text-surface-600 mt-1">JWT claim containing group memberships for team mapping</p>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-surface-300">Mandatory SSO</p>
              <p class="text-xs text-surface-600">Disable built-in auth when OIDC is configured</p>
            </div>
            <button
              type="button"
              onclick={() => { mandatorySso = !mandatorySso }}
              class="relative w-11 h-6 rounded-full transition-colors {mandatorySso
                ? 'bg-accent-600'
                : 'bg-surface-800'}"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {mandatorySso
                  ? 'translate-x-5'
                  : ''}"
              ></span>
            </button>
          </div>

          <button
            type="button"
            onclick={testConnection}
            disabled={testStatus === 'testing'}
            class="bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {#if testStatus === 'testing'}
              Testing...
            {:else if testStatus === 'success'}
              Connection OK
            {:else if testStatus === 'error'}
              Connection Failed — Retry
            {:else}
              Test Connection
            {/if}
          </button>

          {#if testStatus === 'success'}
            <p class="text-xs text-ok-400">OIDC discovery endpoint responded successfully</p>
          {:else if testStatus === 'error'}
            <p class="text-xs text-err-400">Could not reach the issuer URL. Check the URL and try again.</p>
          {/if}
        {/if}

        <div class="pt-4 border-t border-surface-800">
          <button
            type="submit"
            disabled={saving}
            class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Configuration'}
          </button>
          {#if form?.saved}
            <p class="text-xs text-ok-400 mt-2">Configuration saved.</p>
          {:else if form?.error}
            <p class="text-xs text-err-400 mt-2">{form.error}</p>
          {/if}
        </div>
      </div>
    </form>
  {/if}
</div>
