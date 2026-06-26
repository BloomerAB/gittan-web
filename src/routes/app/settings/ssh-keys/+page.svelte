<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'

  let { data, form } = $props()

  let adding = $state(false)
  let removingId = $state<number | null>(null)
  let newKeyTitle = $state('')
  let newKeyContent = $state('')

  type TSSHKey = {
    id: number
    title: string
    fingerprint: string
    createdAt: string
  }

  let keys = $derived(data.keys as TSSHKey[])
</script>

<div>
  <h2 class="text-lg font-semibold text-surface-200 mb-1">SSH Keys</h2>
  <p class="text-sm text-surface-500 mb-6">
    Manage SSH keys used for <code class="font-mono bg-surface-900 px-1 py-0.5 rounded text-surface-400">git push</code> over SSH to gittan.
  </p>

  {#if form?.error}
    <div class="mb-4 px-3 py-2 rounded-md bg-err-400/10 text-err-400 text-sm">{form.error}</div>
  {/if}
  {#if form?.added}
    <div class="mb-4 px-3 py-2 rounded-md bg-green-400/10 text-green-400 text-sm">SSH key added.</div>
  {/if}
  {#if form?.removed}
    <div class="mb-4 px-3 py-2 rounded-md bg-green-400/10 text-green-400 text-sm">SSH key removed.</div>
  {/if}

  <div class="max-w-xl space-y-6">
    {#if keys.length > 0}
      <div>
        <p class="text-[11px] text-surface-600 uppercase tracking-wider mb-2">Your keys</p>
        <div class="space-y-2">
          {#each keys as key}
            <div class="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-900 border border-surface-800">
              <div>
                <p class="text-sm text-surface-300 font-medium">{key.title}</p>
                <p class="text-[11px] text-surface-600 font-mono mt-0.5">{key.fingerprint}</p>
              </div>
              <form
                method="POST"
                action="?/remove"
                use:enhance={() => {
                  removingId = key.id
                  return async ({ update }) => {
                    removingId = null
                    await update()
                    await invalidateAll()
                  }
                }}
              >
                <input type="hidden" name="keyId" value={key.id} />
                <button
                  type="submit"
                  disabled={removingId === key.id}
                  class="text-xs text-err-400/70 hover:text-err-400 transition-colors disabled:opacity-50"
                >
                  {removingId === key.id ? 'Removing...' : 'Remove'}
                </button>
              </form>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div>
      <p class="text-[11px] text-surface-600 uppercase tracking-wider mb-2">Add new key</p>
      <form
        method="POST"
        action="?/add"
        use:enhance={() => {
          adding = true
          return async ({ result, update }) => {
            adding = false
            await update({ reset: false })
            if (result.type === 'success') {
              newKeyTitle = ''
              newKeyContent = ''
              await invalidateAll()
            }
          }
        }}
      >
        <div class="space-y-3">
          <div>
            <label for="keyTitle" class="block text-xs text-surface-400 mb-1">Title</label>
            <input
              id="keyTitle"
              name="title"
              type="text"
              bind:value={newKeyTitle}
              placeholder="work-laptop"
              required
              class="w-full bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 focus:border-accent-500 focus:outline-none"
            />
          </div>
          <div>
            <label for="keyContent" class="block text-xs text-surface-400 mb-1">Public Key</label>
            <textarea
              id="keyContent"
              name="key"
              bind:value={newKeyContent}
              placeholder="ssh-ed25519 AAAA..."
              required
              rows={3}
              class="w-full bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 font-mono focus:border-accent-500 focus:outline-none resize-y"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={adding || !newKeyTitle || !newKeyContent}
            class="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
          >
            {adding ? 'Adding...' : 'Add SSH Key'}
          </button>
        </div>
      </form>
    </div>

    <div class="border-t border-surface-800 pt-4">
      <p class="text-[10px] text-surface-600">
        Paste your public key (e.g. <code class="font-mono">~/.ssh/id_ed25519.pub</code>).
        The key is used for SSH authentication when pushing to <code class="font-mono">git.gittan.eu</code>.
      </p>
    </div>
  </div>
</div>
