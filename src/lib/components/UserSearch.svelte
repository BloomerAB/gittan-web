<script lang="ts">
  type TSearchResult = {
    id: string
    email: string
    name: string
  }

  type Props = {
    onSelect: (user: TSearchResult) => void
    disabled?: boolean
    excludeUserIds?: string[]
  }

  let { onSelect, disabled = false, excludeUserIds = [] }: Props = $props()

  let query = $state('')
  let results = $state<TSearchResult[]>([])
  let showDropdown = $state(false)
  let loading = $state(false)
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  function scheduleSearch(q: string) {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (q.length < 1) {
      results = []
      showDropdown = false
      return
    }
    debounceTimer = setTimeout(() => void doSearch(q), 200)
  }

  async function doSearch(q: string) {
    loading = true
    try {
      const res = await fetch(`/app/admin/teams/members/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) return
      const data = (await res.json()) as TSearchResult[]
      results = data.filter((u) => !excludeUserIds.includes(u.id))
      showDropdown = results.length > 0
    } finally {
      loading = false
    }
  }

  function select(user: TSearchResult) {
    query = ''
    results = []
    showDropdown = false
    onSelect(user)
  }

  function handleBlur() {
    setTimeout(() => { showDropdown = false }, 150)
  }
</script>

<div class="relative">
  <input
    type="text"
    bind:value={query}
    oninput={() => scheduleSearch(query)}
    onfocus={() => { if (results.length > 0) showDropdown = true }}
    onblur={handleBlur}
    {disabled}
    placeholder="Search by name or email..."
    class="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
  />
  {#if loading}
    <span class="absolute right-3 top-2.5 text-xs text-surface-500">...</span>
  {/if}

  {#if showDropdown}
    <div class="absolute z-10 w-full mt-1 bg-surface-900 border border-surface-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
      {#each results as user}
        <button
          type="button"
          onmousedown={() => select(user)}
          class="w-full text-left px-3 py-2 hover:bg-surface-800 transition-colors"
        >
          <span class="text-sm text-surface-300">{user.name}</span>
          <span class="text-xs text-surface-500 ml-2">{user.email}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
