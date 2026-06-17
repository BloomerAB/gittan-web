<script lang="ts">
  let { size = 24 }: { size?: number } = $props()
</script>

<svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2" fill="none" />
  <circle cx="11" cy="10" r="2.5" fill="currentColor" />
  <circle cx="21" cy="10" r="2.5" fill="currentColor" />
  <line x1="11" y1="12.5" x2="16" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  <line x1="21" y1="12.5" x2="16" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  <circle cx="16" cy="19" r="2.5" fill="currentColor" />
  <line x1="16" y1="21.5" x2="16" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  <path d="M11 24 Q16 21 21 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" />
</svg>
