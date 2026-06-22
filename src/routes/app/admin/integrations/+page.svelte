<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let disconnecting = $state(false)
  let savingCredentials = $state(false)

  let slackClientId = $state(data.org?.slackClientId ?? '')
  let slackClientSecret = $state(data.org?.slackClientSecret ?? '')

  let slackConnected = $derived(!!data.org?.slackBotToken)
  let slackCredentialsSaved = $derived(!!data.org?.slackClientId && !!data.org?.slackClientSecret)

  $effect(() => {
    slackClientId = data.org?.slackClientId ?? ''
    slackClientSecret = data.org?.slackClientSecret ?? ''
  })
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-6">Integrations</h2>

  {#if !data.org}
    <p class="text-sm text-surface-500">No organization selected.</p>
  {:else}
    <div class="max-w-xl space-y-6">
      <div>
        <p class="text-sm text-surface-300 mb-1">Slack</p>
        <p class="text-xs text-surface-600 mb-4">
          Connect your Slack workspace to receive pipeline notifications, deploy alerts,
          and team mentions in your configured channels.
        </p>
      </div>

      {#if slackConnected}
        <!-- State 3: Connected -->
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
            <p>Invite <code class="font-mono bg-surface-950 px-1 py-0.5 rounded text-surface-300">@gittan</code> to channels where you want notifications.</p>
            <p>Set each team's channel under <a href="/app/admin/teams" class="text-accent-400 hover:text-accent-300">Teams</a>.</p>
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
      {:else if slackCredentialsSaved}
        <!-- State 2: Credentials saved, ready to connect -->
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 space-y-4">
          <p class="text-sm text-surface-400">
            Slack App configured. Click below to authorize gittan in your Slack workspace.
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

          <form
            method="POST"
            action="?/disconnectSlack"
            use:enhance={() => {
              return async ({ result, update }) => {
                await update()
                if (result.type === 'success') await invalidateAll()
              }
            }}
          >
            <button type="submit" class="text-xs text-surface-600 hover:text-surface-400 transition-colors mt-2">
              Remove credentials and start over
            </button>
          </form>
        </div>
      {:else}
        <!-- State 1: No credentials, show setup guide -->
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 space-y-5">
          <div>
            <p class="text-sm text-surface-300 mb-2">Setup</p>
            <p class="text-xs text-surface-500 mb-3">
              To connect Slack, you need to create a Slack App for your workspace.
              This gives gittan permission to post notifications to your channels.
            </p>

            <ol class="text-xs text-surface-400 space-y-3 list-decimal list-inside">
              <li>
                Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener" class="text-accent-400 hover:text-accent-300">api.slack.com/apps</a> and click <strong class="text-surface-300">Create New App</strong> → <strong class="text-surface-300">From scratch</strong>
              </li>
              <li>
                Name the app <code class="font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300">gittan</code> and select your workspace
              </li>
              <li>
                Go to <strong class="text-surface-300">OAuth & Permissions</strong> and add these Bot Token Scopes:
                <div class="mt-1.5 flex gap-2">
                  <code class="font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300">chat:write</code>
                  <code class="font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300">channels:read</code>
                </div>
              </li>
              <li>
                Still on <strong class="text-surface-300">OAuth & Permissions</strong>, add this Redirect URL:
                <code class="block mt-1.5 font-mono bg-surface-950 px-2 py-1 rounded text-surface-300 text-[11px] select-all">https://gittan.eu/api/integrations/slack/callback</code>
              </li>
              <li>
                Go to <strong class="text-surface-300">Basic Information</strong> and copy the <strong class="text-surface-300">Client ID</strong> and <strong class="text-surface-300">Client Secret</strong>, then paste them below
              </li>
            </ol>
          </div>

          <form
            method="POST"
            action="?/saveSlackCredentials"
            use:enhance={() => {
              savingCredentials = true
              return async ({ result, update }) => {
                savingCredentials = false
                await update()
                if (result.type === 'success') await invalidateAll()
              }
            }}
            class="space-y-3"
          >
            <div class="border-t border-surface-800 pt-4">
              <div class="space-y-3">
                <div>
                  <label class="block text-xs text-surface-500 mb-1" for="slackClientId">Client ID</label>
                  <input
                    id="slackClientId"
                    name="slackClientId"
                    type="text"
                    bind:value={slackClientId}
                    placeholder="Paste from Basic Information"
                    class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label class="block text-xs text-surface-500 mb-1" for="slackClientSecret">Client Secret</label>
                  <input
                    id="slackClientSecret"
                    name="slackClientSecret"
                    type="password"
                    bind:value={slackClientSecret}
                    placeholder="Paste from Basic Information"
                    class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingCredentials || !slackClientId || !slackClientSecret}
                  class="inline-flex items-center gap-2 bg-[#4A154B] hover:bg-[#611f64] disabled:opacity-50 text-white text-sm px-4 py-2.5 rounded-md transition-colors"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z"/>
                  </svg>
                  {savingCredentials ? 'Connecting...' : 'Save & Connect to Slack'}
                </button>
              </div>
            </div>
          </form>
        </div>
      {/if}

      {#if form?.error}
        <p class="text-xs text-err-400">{form.error}</p>
      {/if}
      {#if form?.savedCredentials}
        <p class="text-xs text-ok-400">Credentials saved. Click "Add to Slack" to connect your workspace.</p>
      {/if}
      {#if form?.disconnected}
        <p class="text-xs text-ok-400">Slack disconnected.</p>
      {/if}
    </div>
  {/if}
</div>
