<script lang="ts">
  type TSource = 'policy' | 'template' | 'repo'

  const styles: Record<TSource, string> = {
    policy: 'text-policy-400 bg-policy-400/10',
    template: 'text-surface-400 bg-surface-800',
    repo: '',
  }

  let { source, name }: { source: TSource; name?: string } = $props()
  let label = $derived(name ? `${source}: ${name}` : source)
</script>

{#if source !== 'repo'}
  <span class="text-[11px] px-1.5 py-0.5 rounded {styles[source]}">{label}</span>
{/if}
