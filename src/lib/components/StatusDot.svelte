<script lang="ts">
  type TStatus = 'passed' | 'failed' | 'running' | 'idle' | 'pending' | 'skipped'

  const colors: Record<TStatus, string> = {
    passed: 'bg-ok-400',
    failed: 'bg-err-400',
    running: 'bg-yellow-400 animate-pulse',
    idle: 'bg-ok-400',
    pending: 'bg-surface-600',
    skipped: 'bg-surface-600',
  }

  let { status, size = 'sm' }: { status: TStatus; size?: 'sm' | 'md' } = $props()
  let px = $derived(size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5')
</script>

<span class="inline-block rounded-full {px} {colors[status]}"></span>
