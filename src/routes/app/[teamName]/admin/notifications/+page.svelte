<script lang="ts">
  import { enhance } from '$app/forms'

  let { data, form } = $props()

  let saving = $state(false)
  let slackChannel = $state(data.team?.slackChannel ?? '')
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-1">Notifications</h2>
  <p class="text-sm text-surface-500 mb-6">
    Configure where <span class="text-surface-300 font-medium">{data.team?.displayName ?? 'this team'}</span> receives pipeline notifications.
  </p>

  {#if form?.error}
    <div class="mb-4 px-3 py-2 rounded-md bg-err-400/10 text-err-400 text-sm">{form.error}</div>
  {/if}
  {#if form?.saved}
    <div class="mb-4 px-3 py-2 rounded-md bg-green-400/10 text-green-400 text-sm">Settings saved.</div>
  {/if}

  <div class="max-w-lg">
    {#if !data.slackConnected}
      <div class="px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 text-sm text-surface-500">
        Slack is not connected to this organization. Ask an org admin to set up the Slack integration first.
      </div>
    {:else}
      <form
        method="POST"
        action="?/save"
        use:enhance={() => {
          saving = true
          return async ({ update }) => {
            saving = false
            await update({ reset: false })
          }
        }}
      >
        <div class="space-y-4">
          <div>
            <label for="slackChannel" class="block text-xs text-surface-400 mb-1">Slack Channel</label>
            <div class="flex items-center gap-2">
              <span class="text-surface-600 text-sm">#</span>
              <input
                id="slackChannel"
                name="slackChannel"
                type="text"
                bind:value={slackChannel}
                placeholder="team-deploys"
                class="flex-1 bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 focus:border-accent-500 focus:outline-none"
              />
            </div>
            <p class="text-[10px] text-surface-600 mt-1">
              Pipeline results and deploy alerts will be posted to this channel. Leave empty to disable.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            class="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
