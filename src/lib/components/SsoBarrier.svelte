<script lang="ts">
  let { orgName, ssoEmailDomain }: { orgName: string; ssoEmailDomain?: string } = $props()
  let loading = $state(false)

  async function startLinking() {
    loading = true
    const res = await fetch('/api/identity/link', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      loading = false
    }
  }
</script>

<div class="min-h-[60vh] flex items-center justify-center">
  <div class="max-w-md text-center space-y-4">
    <div class="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
      <svg class="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h2 class="text-lg font-medium text-surface-200">Identity verification required</h2>
    <p class="text-sm text-surface-400">
      <span class="text-surface-300 font-medium">{orgName}</span> requires you to verify your identity through their single sign-on provider before you can access this organization.
    </p>
    {#if ssoEmailDomain}
      <p class="text-xs text-surface-500">
        You will need to sign in with a <span class="text-surface-300 font-mono">@{ssoEmailDomain}</span> account.
      </p>
    {/if}
    <button
      onclick={startLinking}
      disabled={loading}
      class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 disabled:opacity-50 transition-colors"
    >
      {#if loading}
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Redirecting...
      {:else}
        Verify identity
      {/if}
    </button>
  </div>
</div>
