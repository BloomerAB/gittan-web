<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let issuerUrl = $state(data.org?.oidcIssuer ?? '')
  let clientId = $state(data.org?.oidcClientId ?? '')
  let clientSecret = $state('')
  let ssoEmailDomain = $state(data.org?.ssoEmailDomain ?? '')
  let groupsClaim = $state(data.org?.groupsClaim ?? 'groups')
  let oidcTestStatus = $state<'idle' | 'testing' | 'success' | 'error'>('idle')
  let oidcTestError = $state('')
  let savingOidc = $state(false)
  let verifying = $state(false)

  let selfRegistration = $state(data.org?.selfRegistration ?? false)
  let emailVerification = $state(data.org?.emailVerification ?? true)
  let mandatorySso = $state(data.org?.mandatorySso ?? false)
  let savingPolicy = $state(false)

  let oidcConfigured = $derived(!!(data.org?.oidcIssuer && data.org?.oidcClientId))
  let hasLinkedIdentity = $derived(!!(data.linkedIdentities?.length))

  $effect(() => {
    issuerUrl = data.org?.oidcIssuer ?? ''
    clientId = data.org?.oidcClientId ?? ''
    clientSecret = ''
    ssoEmailDomain = data.org?.ssoEmailDomain ?? ''
    groupsClaim = data.org?.groupsClaim ?? 'groups'
    selfRegistration = data.org?.selfRegistration ?? false
    emailVerification = data.org?.emailVerification ?? true
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
  <h2 class="text-lg font-semibold text-surface-200 mb-2">Authentication</h2>
  <p class="text-xs text-surface-600 mb-8">Configure how members sign in and who can join your organization.</p>

  {#if !data.org}
    <p class="text-sm text-surface-500">No organization selected.</p>
  {:else}

    <!-- Section 1: Identity Provider -->
    <div class="max-w-xl">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="text-sm font-medium text-surface-300">Identity Provider</h3>
        {#if oidcConfigured && hasLinkedIdentity}
          <span class="inline-flex items-center gap-1 text-[11px] text-ok-400 bg-ok-400/10 px-2 py-0.5 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-ok-400"></span>
            Connected
          </span>
        {:else if oidcConfigured}
          <span class="inline-flex items-center gap-1 text-[11px] text-warn-400 bg-warn-400/10 px-2 py-0.5 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-warn-400"></span>
            Not verified
          </span>
        {/if}
      </div>
      <p class="text-xs text-surface-600 mb-5">
        Connect an external identity provider (Entra ID, Okta, Keycloak) for SSO login and automatic team mapping.
      </p>

      {#if oidcConfigured && hasLinkedIdentity}
        <!-- Collapsed view when configured + verified -->
        <div class="space-y-3 mb-4">
          {#each data.linkedIdentities as identity}
            <div class="flex items-center justify-between bg-surface-900 border border-surface-800 rounded-md px-4 py-3">
              <div class="min-w-0">
                <p class="text-sm text-surface-200 truncate">{identity.displayName || identity.email}</p>
                {#if identity.displayName && identity.email}
                  <p class="text-xs text-surface-500 truncate">{identity.email}</p>
                {/if}
                <p class="text-xs text-surface-600 mt-1 truncate font-mono">{identity.issuer}</p>
              </div>
              <span class="shrink-0 ml-3 inline-flex items-center gap-1 text-xs text-ok-400">
                <span class="w-1.5 h-1.5 rounded-full bg-ok-400"></span>
                Verified
              </span>
            </div>
          {/each}
        </div>

        <details class="group">
          <summary class="text-xs text-surface-500 hover:text-surface-400 cursor-pointer select-none mb-4">
            Edit configuration
          </summary>
          <div class="pt-2">
            {@render oidcForm()}
          </div>
        </details>
      {:else}
        <!-- Expanded form when not configured or not verified -->
        {@render oidcForm()}

        {#if oidcConfigured && !hasLinkedIdentity}
          <div class="mt-4 p-3 bg-warn-400/5 border border-warn-400/20 rounded-md">
            <p class="text-xs text-warn-400">
              Configuration saved but not verified. Click "Verify Connection" to sign in with your identity provider and confirm it works.
            </p>
          </div>
        {/if}
      {/if}
    </div>

    <div class="border-t border-surface-800 my-8"></div>

    <!-- Section 2: Access Policy -->
    <form
      method="POST"
      action="?/savePolicy"
      use:enhance={() => {
        savingPolicy = true
        return async ({ result, update }) => {
          savingPolicy = false
          await update()
          if (result.type === 'success') await invalidateAll()
        }
      }}
    >
      <div class="max-w-xl">
        <h3 class="text-sm font-medium text-surface-300 mb-1">Access Policy</h3>
        <p class="text-xs text-surface-600 mb-5">Control who can join and how members authenticate.</p>

        <div class="space-y-5">
          <input type="hidden" name="selfRegistration" value={selfRegistration ? 'true' : 'false'} />
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-surface-300">Self-registration</p>
              <p class="text-xs text-surface-600">
                {#if oidcConfigured}
                  Allow anyone with a matching email to join via SSO or email/password without an invitation.
                {:else}
                  Allow users to create accounts with email/password without an invitation.
                {/if}
              </p>
            </div>
            <button
              type="button"
              onclick={() => { selfRegistration = !selfRegistration }}
              class="relative shrink-0 w-11 h-6 rounded-full transition-colors {selfRegistration
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
              <p class="text-xs text-surface-600">Require email verification before account activation.</p>
            </div>
            <button
              type="button"
              onclick={() => { emailVerification = !emailVerification }}
              class="relative shrink-0 w-11 h-6 rounded-full transition-colors {emailVerification
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

          <input type="hidden" name="mandatorySso" value={mandatorySso ? 'true' : 'false'} />
          <div class="flex items-center justify-between {oidcConfigured ? '' : 'opacity-40'}">
            <div>
              <p class="text-sm text-surface-300">Mandatory SSO</p>
              <p class="text-xs text-surface-600">
                {#if oidcConfigured}
                  Require all members to sign in via SSO. Org owners can still use email/password.
                {:else}
                  Configure an identity provider first to enable mandatory SSO.
                {/if}
              </p>
            </div>
            <button
              type="button"
              disabled={!oidcConfigured}
              onclick={() => { mandatorySso = !mandatorySso }}
              class="relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:cursor-not-allowed {mandatorySso
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

          <div class="pt-4 border-t border-surface-800">
            <button
              type="submit"
              disabled={savingPolicy}
              class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {savingPolicy ? 'Saving...' : 'Save'}
            </button>
            {#if form?.savedPolicy}
              <span class="text-xs text-ok-400 ml-3">Saved.</span>
            {:else if form?.error}
              <span class="text-xs text-err-400 ml-3">{form.error}</span>
            {/if}
          </div>
        </div>
      </div>
    </form>
  {/if}
</div>

{#snippet oidcForm()}
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
    <div class="space-y-5">
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
          placeholder={oidcConfigured ? '••••••••  (leave empty to keep current)' : 'Enter client secret'}
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
        <p class="text-[11px] text-surface-600 mt-1">Required email domain for SSO users.</p>
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
        <p class="text-[11px] text-surface-600 mt-1">ID token claim containing group memberships for team mapping.</p>
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
          <span class="text-xs text-ok-400">OIDC discovery endpoint reachable</span>
        {:else if oidcTestStatus === 'error'}
          <span class="text-xs text-err-400">{oidcTestError || 'Could not reach issuer'}</span>
        {/if}
      </div>

      <div class="pt-4 border-t border-surface-800 flex items-center gap-3">
        <button
          type="submit"
          disabled={savingOidc}
          class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {savingOidc ? 'Saving...' : 'Save'}
        </button>
        {#if form?.savedOidc}
          <span class="text-xs text-ok-400">Saved.</span>
        {/if}
      </div>
    </div>
  </form>

  {#if oidcConfigured}
    <form
      method="POST"
      action="?/verifyOidc"
      class="mt-3"
      use:enhance={() => {
        verifying = true
        return async ({ result, update }) => {
          verifying = false
          if (result.type === 'success' && result.data?.verifyUrl) {
            window.location.href = result.data.verifyUrl as string
            return
          }
          await update()
          if (result.type === 'success') await invalidateAll()
        }
      }}
    >
      <button
        type="submit"
        disabled={verifying}
        class="bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
      >
        {verifying ? 'Redirecting...' : 'Verify Connection'}
      </button>
      {#if form?.alreadyVerified}
        <span class="text-xs text-ok-400 ml-3">Already verified.</span>
      {/if}
    </form>
  {/if}
{/snippet}
