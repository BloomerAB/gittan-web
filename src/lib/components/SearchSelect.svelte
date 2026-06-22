<script lang="ts">
  type TOption = {
    readonly value: string
    readonly label: string
    readonly detail?: string
  }

  type Props = {
    options: TOption[]
    onSelect: (option: TOption) => void
    placeholder?: string
    disabled?: boolean
  }

  let { options, onSelect, placeholder = 'Search...', disabled = false }: Props = $props()

  let query = $state('')
  let showDropdown = $state(false)

  let filtered = $derived(
    query.length > 0
      ? options.filter(
          (o) =>
            o.value.toLowerCase().includes(query.toLowerCase()) ||
            o.label.toLowerCase().includes(query.toLowerCase()),
        )
      : options,
  )

  function select(option: TOption) {
    query = option.value
    showDropdown = false
    onSelect(option)
  }

  function handleBlur() {
    setTimeout(() => {
      showDropdown = false
    }, 150)
  }
</script>

<div class="relative">
  <input
    type="text"
    bind:value={query}
    onfocus={() => {
      showDropdown = true
    }}
    onblur={handleBlur}
    {disabled}
    {placeholder}
    class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
  />

  {#if showDropdown && filtered.length > 0}
    <div
      class="absolute z-10 w-full mt-1 bg-surface-900 border border-surface-700 rounded-md shadow-lg max-h-48 overflow-y-auto"
    >
      {#each filtered as option}
        <button
          type="button"
          onmousedown={() => select(option)}
          class="w-full text-left px-3 py-2 hover:bg-surface-800 transition-colors"
        >
          <span class="text-sm text-surface-300 font-mono">{option.value}</span>
          {#if option.detail}
            <span class="text-xs text-surface-500 ml-2">{option.detail}</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
