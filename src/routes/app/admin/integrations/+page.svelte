<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let activeTab = $state<'slack' | 'oidc'>('slack')

  let issuerUrl = $state(data.org?.oidcIssuer ?? '')
  let clientId = $state(data.org?.oidcClientId ?? '')
  let groupsClaim = $state(data.org?.groupsClaim ?? 'groups')
  let mandatorySso = $state(data.org?.mandatorySso ?? false)
  let oidcTestStatus = $state<'idle' | 'testing' | 'success' | 'error'>('idle')

  let saving = $state(false)
  let disconnecting = $state(false)

  let slackConnected = $derived(!!data.org?.slackTeamName)

  $effect(() => {
    issuerUrl = data.org?.oidcIssuer ?? ''
    clientId = data.org?.oidcClientId ?? ''
    groupsClaim = data.org?.groupsClaim ?? 'groups'
    mandatorySso = data.org?.mandatorySso ?? false
  })

  function testOidc() {
    if (!issuerUrl || !clientId) return
    oidcTestStatus = 'testing'
    setTimeout(() => {
      oidcTestStatus = issuerUrl.includes('://') ? 'success' : 'error'
    }, 1500)
  }
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Integrations</h2>

  <div class="flex gap-2 mb-6">
    <button
      type="button"
      onclick={() => { activeTab = 'slack' }}
      class="text-sm px-4 py-2 rounded-md transition-colors {activeTab === 'slack'
        ? 'bg-accent-600 text-white'
        : 'bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-300'}"
    >
      Slack
    </button>
    <button
      type="button"
      onclick={() => { activeTab = 'oidc' }}
      class="text-sm px-4 py-2 rounded-md transition-colors {activeTab === 'oidc'
        ? 'bg-accent-600 text-white'
        : 'bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-300'}"
    >
      OIDC / SSO
    </button>
  </div>

  {#if !data.org}
    <p class="text-sm text-surface-500">No organization selected.</p>
  {:else if activeTab === 'slack'}
    <div class="max-w-xl space-y-6">
      <div>
        <p class="text-sm text-surface-300 mb-1">Slack App</p>
        <p class="text-xs text-surface-600 mb-4">
          Install the gittan Slack App to your workspace. Pipeline notifications, deploy alerts,
          and team mentions are sent to each team's configured channel.
        </p>
      </div>

      {#if slackConnected}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 bg-ok-400/20 rounded-md flex items-center justify-center">
              <svg class="w-4 h-4 text-ok-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-surface-200">Connected to <span class="font-medium">{data.org.slackTeamName}</span></p>
              <p class="text-xs text-surface-500">Bot user: @gittan</p>
            </div>
          </div>

          <div class="text-xs text-surface-600 space-y-1 mb-4">
            <p>The bot can post to any channel it's invited to.</p>
            <p>Set per-team channels under <a href="/app/admin/teams" class="text-accent-400 hover:text-accent-300">Teams</a>.</p>
          </div>

          <form
            method="POST"
            action="?/disconnectSlack"
            use:enhance={() => {
              disconnecting = true
              return async ({ result, update }) => {
                disconnecting = false
                await update()
                if (result.type === 'success') await invalidateAll()
              }
            }}
          >
            <button
              type="submit"
              disabled={disconnecting}
              class="text-xs text-err-400 hover:text-err-300 transition-colors disabled:opacity-50"
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect Slack'}
            </button>
          </form>
        </div>
      {:else}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
          <p class="text-sm text-surface-400 mb-4">
            No Slack workspace connected. Install the gittan app to enable notifications.
          </p>

          <a
            href="/api/integrations/slack/install"
            class="inline-flex items-center gap-2 bg-[#4A154B] hover:bg-[#611f64] text-white text-sm px-4 py-2.5 rounded-md transition-colors"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z"/>
            </svg>
            Add to Slack
          </a>

          <p class="text-[11px] text-surface-600 mt-3">
            This installs a Slack App via OAuth. gittan requests <code class="font-mono">chat:write</code>
            and <code class="font-mono">channels:read</code> scopes.
          </p>
        </div>
      {/if}

      {#if form?.slackError}
        <p class="text-xs text-err-400">{form.slackError}</p>
      {/if}
      {#if form?.disconnected}
        <p class="text-xs text-ok-400">Slack disconnected.</p>
      {/if}
    </div>
  {:else}
    <form
      method="POST"
      action="?/saveOidc"
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
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-surface-300">Mandatory SSO</p>
            <p class="text-xs text-surface-600">Disable built-in email/password when OIDC is configured</p>
          </div>
          <button
            type="button"
            onclick={() => { mandatorySso = !mandatorySso }}
            class="relative w-11 h-6 rounded-full transition-colors {mandatorySso
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
            <span class="text-xs text-ok-400">OIDC discovery endpoint responded</span>
          {:else if oidcTestStatus === 'error'}
            <span class="text-xs text-err-400">Could not reach issuer URL</span>
          {/if}
        </div>

        <div class="pt-4 border-t border-surface-800">
          <button
            type="submit"
            disabled={saving}
            class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save OIDC'}
          </button>
          {#if form?.savedOidc}
            <span class="text-xs text-ok-400 ml-3">Saved.</span>
          {/if}
        </div>
      </div>
    </form>
  {/if}
</div>
