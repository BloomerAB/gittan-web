<script lang="ts">
  let { title, subtitle, children }: { title: string; subtitle: string; children: import('svelte').Snippet } = $props()
</script>

<div class="max-w-2xl mx-auto px-6 py-12 space-y-8">
  <div class="space-y-6">
    <a href="/docs" class="text-xs text-surface-500 hover:text-surface-400 transition-colors">&larr; All posts</a>
    <div class="space-y-2">
      <h1 class="text-3xl font-bold text-surface-200 tracking-tight leading-tight">{title}</h1>
      <p class="text-surface-500 text-sm">{subtitle}</p>
    </div>
  </div>

  <div class="space-y-5 text-sm text-surface-400 leading-relaxed">
    {@render children()}
  </div>
</div>
