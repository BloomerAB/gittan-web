<script lang="ts">
  import GittanLogo from '$lib/components/GittanLogo.svelte'
  let { children } = $props()
</script>

<div class="min-h-screen bg-surface-950 text-surface-300">
  <header class="border-b border-surface-800 px-6 h-12 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 text-white hover:text-surface-200 transition-colors">
      <GittanLogo size={22} />
      <span class="text-lg font-semibold tracking-tight">gittan<span style="color: #c4993a">.</span></span>
    </a>
    <div class="flex items-center gap-4">
      <a href="/docs" class="text-surface-500 hover:text-surface-300 text-sm">Docs</a>
      <a href="/app" class="text-surface-500 hover:text-surface-300 text-sm">Dashboard</a>
    </div>
  </header>

  {@render children()}
</div>
