<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let selfRegistration = $state(data.org?.selfRegistration ?? false)
  let emailVerification = $state(data.org?.emailVerification ?? true)
  let saving = $state(false)

  let issuerUrl = $state(data.org?.oidcIssuer ?? '')
  let clientId = $state(data.org?.oidcClientId ?? '')
  let clientSecret = $state(data.org?.oidcClientSecret ?? '')
  let ssoEmailDomain = $state(data.org?.ssoEmailDomain ?? '')
  let groupsClaim = $state(data.org?.groupsClaim ?? 'groups')
  let mandatorySso = $state(data.org?.mandatorySso ?? false)
  let oidcTestStatus = $state<'idle' | 'testing' | 'success' | 'error'>('idle')
  let oidcTestError = $state('')
  let savingOidc = $state(false)

  let oidcConfigured = $derived(!!(data.org?.oidcIssuer && data.org?.oidcClientId))

  $effect(() => {
    selfRegistration = data.org?.selfRegistration ?? false
    emailVerification = data.org?.emailVerification ?? true
    issuerUrl = data.org?.oidcIssuer ?? ''
    clientId = data.org?.oidcClientId ?? ''
    clientSecret = data.org?.oidcClientSecret ?? ''
    ssoEmailDomain = data.org?.ssoEmailDomain ?? ''
    groupsClaim = data.org?.groupsClaim ?? 'groups'
    mandatorySso = data.org?.mandatorySso ?? false
  })

  async function testOidc() {
    if (!issuerUrl || !clientId) return
    oidcTestStatus = 'testing'
    oidcTestError = ''
    try {
      const res = await fetch(`/api/admin/oidc-test?issuer=${encodeURIComponent(issuerUrl)}`)
      const result = await res.json() as { ok: boolean; error?: string; issuer?: string }
      if (result.ok) {
        oidcTestStatus = 'success'
      } else {
        oidcTestStatus = 'error'
        oidcTestError = result.error ?? 'Unknown error'
      }
    } catch {
      oidcTestStatus = 'error'
      oidcTestError = 'Failed to reach test endpoint'
    }
  }
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
        <div>
          <p class="text-sm text-surface-300 mb-1">Built-in Authentication</p>
          <p class="text-xs text-surface-600 mb-4">Email/password login and registration settings.</p>
        </div>

        <input type="hidden" name="selfRegistration" value={selfRegistration ? 'true' : 'false'} />
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-surface-300">Self-registration</p>
            <p class="text-xs text-surface-600">Allow users to create accounts without an invitation (applies to both email/password and SSO)</p>
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

    <div class="border-t border-surface-800 my-8"></div>

    <form
      method="POST"
      action="?/saveOidc"
      use:enhance={() => {
        savingOidc = true
        return async ({ result, update }) => {
          savingOidc = false
          await update()
          if (result.type === 'success') await invalidateAll()
        }
      }}
    >
      <div class="max-w-xl space-y-6">
        <div>
          <p class="text-sm text-surface-300 mb-1">OIDC Single Sign-On</p>
          <p class="text-xs text-surface-600 mb-4">
            Connect your identity provider (Entra ID, Okta, Keycloak, etc.) for SSO login
            and automatic team mapping via group claims.
          </p>
        </div>

        <div>
          <label class="block text-xs text-surface-500 mb-1" for="oidcIssuer">Issuer URL</label>
          <input
            id="oidcIssuer"
            name="oidcIssuer"
            type="url"
            bind:value={issuerUrl}
            placeholder="https://login.example.com/realms/org"
            class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
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
          <label class="block text-xs text-surface-500 mb-1" for="oidcClientSecret">Client Secret</label>
          <input
            id="oidcClientSecret"
            name="oidcClientSecret"
            type="password"
            bind:value={clientSecret}
            placeholder="Enter client secret"
            class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
          <p class="text-[11px] text-surface-600 mt-1">From your identity provider's app registration. Stored encrypted.</p>
        </div>

        <div>
          <label class="block text-xs text-surface-500 mb-1" for="ssoEmailDomain">Email Domain</label>
          <input
            id="ssoEmailDomain"
            name="ssoEmailDomain"
            type="text"
            bind:value={ssoEmailDomain}
            placeholder="bloomer.se"
            class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
          <p class="text-[11px] text-surface-600 mt-1">Required email domain for SSO users. Shown to users joining this organization.</p>
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

        <input type="hidden" name="mandatorySso" value={mandatorySso ? 'true' : 'false'} />
        <div class="flex items-center justify-between {oidcConfigured ? '' : 'opacity-50'}">
          <div>
            <p class="text-sm text-surface-300">Mandatory SSO</p>
            <p class="text-xs text-surface-600">Require all members to sign in via SSO. Does not apply to org owners.</p>
            {#if !oidcConfigured}
              <p class="text-xs text-surface-600 mt-0.5">Save OIDC configuration first to enable this.</p>
            {/if}
          </div>
          <button
            type="button"
            disabled={!oidcConfigured}
            onclick={() => { mandatorySso = !mandatorySso }}
            class="relative w-11 h-6 rounded-full transition-colors disabled:cursor-not-allowed {mandatorySso
              ? 'bg-accent-600'
              : 'bg-surface-800'}"
            aria-label="Toggle mandatory SSO"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {mandatorySso
                ? 'translate-x-5'
                : ''}"
            ></span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            onclick={testOidc}
            disabled={oidcTestStatus === 'testing' || !issuerUrl || !clientId}
            class="bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {#if oidcTestStatus === 'testing'}
              Testing...
            {:else if oidcTestStatus === 'success'}
              Connection OK
            {:else if oidcTestStatus === 'error'}
              Failed — Retry
            {:else}
              Test Connection
            {/if}
          </button>
          {#if oidcTestStatus === 'success'}
            <span class="text-xs text-ok-400">OIDC discovery endpoint OK</span>
          {:else if oidcTestStatus === 'error'}
            <span class="text-xs text-err-400">{oidcTestError || 'Could not reach issuer'}</span>
          {/if}
        </div>

        <div class="pt-4 border-t border-surface-800">
          <button
            type="submit"
            disabled={savingOidc}
            class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {savingOidc ? 'Saving...' : 'Save & Verify'}
          </button>
          {#if form?.savedOidc}
            <span class="text-xs text-ok-400 ml-3">Saved.</span>
          {/if}
        </div>
      </div>
    </form>
  {/if}
</div>
