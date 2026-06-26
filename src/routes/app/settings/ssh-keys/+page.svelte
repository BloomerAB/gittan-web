<script lang="ts">
  let { data } = $props()

  let newKeyContent = $state('')
  let newKeyTitle = $state('')
</script>

<div class="p-6">
  <h2 class="text-lg font-semibold text-surface-200 mb-1">SSH Keys</h2>
  <p class="text-sm text-surface-500 mb-6">
    Manage SSH keys used for <code class="font-mono bg-surface-900 px-1 py-0.5 rounded text-surface-400">git push</code> over SSH to gittan.
  </p>

  <div class="max-w-xl">
    <div class="px-4 py-3 rounded-lg bg-surface-900 border border-surface-800 text-sm text-surface-500 mb-6">
      SSH key management is coming soon. For now, contact your org admin to add your key.
    </div>

    <div class="opacity-50 pointer-events-none space-y-4">
      <div>
        <label for="keyTitle" class="block text-xs text-surface-400 mb-1">Title</label>
        <input
          id="keyTitle"
          type="text"
          bind:value={newKeyTitle}
          placeholder="work-laptop"
          class="w-full bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 focus:border-accent-500 focus:outline-none"
        />
      </div>
      <div>
        <label for="keyContent" class="block text-xs text-surface-400 mb-1">Public Key</label>
        <textarea
          id="keyContent"
          bind:value={newKeyContent}
          placeholder="ssh-ed25519 AAAA..."
          rows={3}
          class="w-full bg-surface-950 border border-surface-700 rounded px-3 py-2 text-sm text-surface-300 font-mono focus:border-accent-500 focus:outline-none resize-y"
        ></textarea>
      </div>
      <button
        type="button"
        disabled
        class="bg-accent-600 text-white text-sm font-medium px-4 py-2.5 rounded opacity-50"
      >
        Add SSH Key
      </button>
    </div>
  </div>
</div>
