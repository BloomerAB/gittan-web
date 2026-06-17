<script lang="ts">
  type TColor = 'emerald' | 'yellow' | 'red' | 'zinc'

  const colorClasses: Record<TColor, string> = {
    emerald: 'text-accent-400',
    yellow: 'text-yellow-400',
    red: 'text-err-400',
    zinc: 'text-surface-500',
  }

  let { label, value, description, color = 'zinc' }: {
    label: string
    value: string
    description: string
    color?: TColor
  } = $props()
</script>

<div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
  <p class="text-[11px] uppercase text-surface-500 tracking-wider">{label}</p>
  <p class="text-2xl font-semibold mt-1 {colorClasses[color]}">{value}</p>
  <p class="text-[11px] text-surface-600 mt-1">{description}</p>
</div>
