<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte'

  type TMatchCriteria = {
    files?: string
    team?: string
    name?: string
  }

  type TInjectStep = {
    position: 'before' | 'after'
    stepName: string
    use: string
  }

  type TPolicy = {
    id: string
    name: string
    description: string
    enabled: boolean
    match: TMatchCriteria
    steps: TInjectStep[]
  }

  let showCreateForm = $state(false)
  let policies = $state<TPolicy[]>([])

  let newName = $state('')
  let newDescription = $state('')
  let newMatchFiles = $state('')
  let newMatchTeam = $state('')
  let newMatchName = $state('')
  let newSteps = $state<TInjectStep[]>([])

  let stepPosition = $state<'before' | 'after'>('before')
  let stepName = $state('')
  let stepUse = $state('')

  function addStep() {
    if (!stepName || !stepUse) return
    newSteps = [...newSteps, { position: stepPosition, stepName, use: stepUse }]
    stepName = ''
    stepUse = ''
    stepPosition = 'before'
  }

  function removeStep(index: number) {
    newSteps = newSteps.filter((_, i) => i !== index)
  }

  function createPolicy() {
    if (!newName) return
    const policy: TPolicy = {
      id: crypto.randomUUID(),
      name: newName,
      description: newDescription,
      enabled: true,
      match: {
        ...(newMatchFiles ? { files: newMatchFiles } : {}),
        ...(newMatchTeam ? { team: newMatchTeam } : {}),
        ...(newMatchName ? { name: newMatchName } : {}),
      },
      steps: [...newSteps],
    }
    policies = [...policies, policy]
    newName = ''
    newDescription = ''
    newMatchFiles = ''
    newMatchTeam = ''
    newMatchName = ''
    newSteps = []
    showCreateForm = false
  }

  function matchTags(match: TMatchCriteria): string[] {
    const tags: string[] = []
    if (match.files) tags.push(`files:${match.files}`)
    if (match.team) tags.push(`team:${match.team}`)
    if (match.name) tags.push(`name:${match.name}`)
    return tags
  }
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-surface-200">Policies</h2>
    <button
      onclick={() => { showCreateForm = !showCreateForm }}
      class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
    >
      {showCreateForm ? 'Cancel' : 'Create Policy'}
    </button>
  </div>

  {#if showCreateForm}
    <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 mb-6 max-w-xl">
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-surface-500 mb-1">Name</label>
          <input
            type="text"
            bind:value={newName}
            placeholder="require-security-scan"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1">Description</label>
          <input
            type="text"
            bind:value={newDescription}
            placeholder="Require Trivy scan on all pushes"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          />
        </div>

        <div>
          <p class="text-xs text-surface-500 mb-2">Match Criteria</p>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-[11px] text-surface-600 mb-1">Files</label>
              <input
                type="text"
                bind:value={newMatchFiles}
                placeholder="*.tf"
                class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-[11px] text-surface-600 mb-1">Team</label>
              <input
                type="text"
                bind:value={newMatchTeam}
                placeholder="backend"
                class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-[11px] text-surface-600 mb-1">Name</label>
              <input
                type="text"
                bind:value={newMatchName}
                placeholder="api-*"
                class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs text-surface-500 mb-2">Inject Steps</p>
          {#if newSteps.length > 0}
            <div class="space-y-1 mb-2">
              {#each newSteps as step, i}
                <div class="flex items-center gap-2 text-sm text-surface-400">
                  <span class="text-policy-400">{step.position}</span>
                  <span class="font-mono">{step.stepName}</span>
                  <span class="text-surface-600">use:</span>
                  <span class="font-mono">{step.use}</span>
                  <button
                    onclick={() => removeStep(i)}
                    class="text-err-400 hover:text-err-300 text-xs ml-auto transition-colors"
                  >
                    remove
                  </button>
                </div>
              {/each}
            </div>
          {/if}
          <div class="flex gap-2">
            <select
              bind:value={stepPosition}
              class="bg-surface-950 border border-surface-800 rounded-md px-2 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            >
              <option value="before">before</option>
              <option value="after">after</option>
            </select>
            <input
              type="text"
              bind:value={stepName}
              placeholder="Step name"
              class="flex-1 bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
            <input
              type="text"
              bind:value={stepUse}
              placeholder="use: platform/trivy"
              class="flex-1 bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
            <button
              onclick={addStep}
              class="bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm px-3 py-2 rounded-md transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <button
          onclick={createPolicy}
          class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          Create Policy
        </button>
      </div>
    </div>
  {/if}

  {#if policies.length === 0}
    <EmptyState
      title="No policies configured"
      description="Policies inject steps into pipelines based on match criteria"
    />
  {:else}
    <div class="space-y-3">
      {#each policies as policy}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-2">
            <span class="font-mono text-sm text-surface-200">{policy.name}</span>
            <span
              class="text-[11px] px-2 py-0.5 rounded-full {policy.enabled
                ? 'bg-ok-400/10 text-ok-400'
                : 'bg-surface-800 text-surface-500'}"
            >
              {policy.enabled ? 'enabled' : 'disabled'}
            </span>
            <span class="text-[11px] text-surface-500 ml-auto">
              {policy.steps.length} step{policy.steps.length !== 1 ? 's' : ''}
            </span>
          </div>
          {#if policy.description}
            <p class="text-xs text-surface-500 mb-2">{policy.description}</p>
          {/if}
          <div class="flex gap-2 flex-wrap">
            {#each matchTags(policy.match) as tag}
              <span class="text-[11px] bg-policy-400/10 text-policy-400 px-2 py-0.5 rounded font-mono">
                {tag}
              </span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
