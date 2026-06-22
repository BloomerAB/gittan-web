<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let disconnecting = $state(false)

  let slackConnected = $derived(!!data.org?.slackTeamName)
  let slackConfigured = $derived(!!data.slackConfigured)
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
      {:else if slackConfigured}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
          <p class="text-sm text-surface-400 mb-4">
            No Slack workspace connected. Click below to authorize gittan in your Slack workspace.
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

          <div class="mt-4 text-xs text-surface-600 space-y-2">
            <p>After connecting, invite <code class="font-mono bg-surface-950 px-1 py-0.5 rounded text-surface-300">@gittan</code> to the channels where you want notifications.</p>
            <p>Then set each team's Slack channel under <a href="/app/admin/teams" class="text-accent-400 hover:text-accent-300">Teams</a>.</p>
          </div>
        </div>
      {:else}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 space-y-4">
          <p class="text-sm text-surface-300">Slack integration is not configured yet.</p>
          <p class="text-xs text-surface-500">To enable it, create a Slack App and add the credentials to the gittan deployment:</p>

          <ol class="text-xs text-surface-400 space-y-3 list-decimal list-inside">
            <li>
              Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener" class="text-accent-400 hover:text-accent-300">api.slack.com/apps</a> and click <strong class="text-surface-300">Create New App</strong> → <strong class="text-surface-300">From scratch</strong>
            </li>
            <li>
              Name it <code class="font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300">gittan</code> and select your workspace
            </li>
            <li>
              Under <strong class="text-surface-300">OAuth & Permissions</strong>, add Bot Token Scopes:
              <span class="font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300">chat:write</span>
              <span class="font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300">channels:read</span>
            </li>
            <li>
              Add this Redirect URL under <strong class="text-surface-300">OAuth & Permissions</strong>:
              <code class="block mt-1 font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300 text-[11px]">https://gittan.eu/api/integrations/slack/callback</code>
            </li>
            <li>
              Copy <strong class="text-surface-300">Client ID</strong> and <strong class="text-surface-300">Client Secret</strong> from <strong class="text-surface-300">Basic Information</strong> and set them as env vars:
              <code class="block mt-1 font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300 text-[11px]">SLACK_CLIENT_ID</code>
              <code class="block mt-1 font-mono bg-surface-950 px-1.5 py-0.5 rounded text-surface-300 text-[11px]">SLACK_CLIENT_SECRET</code>
            </li>
          </ol>

          <p class="text-[11px] text-surface-600">Once configured, the "Add to Slack" button appears here for all organizations.</p>
        </div>
      {/if}

      {#if form?.slackError}
        <p class="text-xs text-err-400">{form.slackError}</p>
      {/if}
      {#if form?.disconnected}
        <p class="text-xs text-ok-400">Slack disconnected.</p>
      {/if}
    </div>
  {/if}
</div>
