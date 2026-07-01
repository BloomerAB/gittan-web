<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import SearchSelect from '$lib/components/SearchSelect.svelte'
  import type { PageData, ActionData } from './$types'

  type TInjectStep = {
    position: 'before' | 'after'
    name: string
    use?: string
  }

  type TPolicy = {
    id: string
    name: string
    description?: string
    matchFiles?: string
    matchTeam?: string
    matchName?: string
    steps?: { position: string; name: string; use?: string }[]
  }

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let stepOptions = $derived(
    (data.steps ?? []).map((s) => ({
      value: s.name,
      label: s.name,
      detail: s.description ?? s.image,
    })),
  )

  let showCreateForm = $state(false)
  let creating = $state(false)
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
    newSteps = [...newSteps, { position: stepPosition, name: stepName, use: stepUse }]
    stepName = ''
    stepUse = ''
    stepPosition = 'before'
  }

  function removeStep(index: number) {
    newSteps = newSteps.filter((_, i) => i !== index)
  }

  function stepsJson(): string {
    return newSteps.length > 0 ? JSON.stringify(newSteps) : ''
  }

  function resetForm() {
    newName = ''
    newDescription = ''
    newMatchFiles = ''
    newMatchTeam = ''
    newMatchName = ''
    newSteps = []
    stepName = ''
    stepUse = ''
    stepPosition = 'before'
    showCreateForm = false
  }

  function matchTags(policy: TPolicy): string[] {
    const tags: string[] = []
    if (policy.matchFiles) tags.push(`files:${policy.matchFiles}`)
    if (policy.matchTeam) tags.push(`team:${policy.matchTeam}`)
    if (policy.matchName) tags.push(`name:${policy.matchName}`)
    return tags
  }
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-surface-200">Policies</h2>
    <button
      onclick={() => { showCreateForm = !showCreateForm }}
      class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
    >
      {showCreateForm ? 'Cancel' : 'Create Policy'}
    </button>
  </div>

  {#if form?.error}
    <div class="mb-4 px-3 py-2 rounded-md bg-err-400/10 text-err-400 text-sm">
      {form.error}
    </div>
  {/if}

  {#if showCreateForm}
    <form
      method="POST"
      action="?/createPolicy"
      use:enhance={({ formData }) => {
        formData.set('steps', stepsJson())
        creating = true
        return async ({ result, update }) => {
          creating = false
          await update()
          if (result.type === 'success') {
            resetForm()
            await invalidateAll()
          }
        }
      }}
      class="bg-surface-900 border border-surface-800 rounded-lg p-4 mb-6 max-w-xl"
    >
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="policy-name">Name</label>
          <input
            id="policy-name"
            type="text"
            name="name"
            bind:value={newName}
            placeholder="require-security-scan"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="policy-description">Description</label>
          <input
            id="policy-description"
            type="text"
            name="description"
            bind:value={newDescription}
            placeholder="Require Trivy scan on all pushes"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          />
        </div>

        <div>
          <p class="text-xs text-surface-500 mb-2">Match Criteria</p>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-[11px] text-surface-600 mb-1" for="match-files">Files</label>
              <input
                id="match-files"
                type="text"
                name="matchFiles"
                bind:value={newMatchFiles}
                placeholder="*.tf"
                class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-[11px] text-surface-600 mb-1" for="match-team">Team</label>
              <input
                id="match-team"
                type="text"
                name="matchTeam"
                bind:value={newMatchTeam}
                placeholder="backend"
                class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-[11px] text-surface-600 mb-1" for="match-name">Name</label>
              <input
                id="match-name"
                type="text"
                name="matchName"
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
                  <span class="font-mono">{step.name}</span>
                  <span class="text-surface-600">use:</span>
                  <span class="font-mono">{step.use}</span>
                  <button
                    type="button"
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
            <div class="flex-1">
              <SearchSelect
                options={stepOptions}
                onSelect={(o) => { stepUse = o.value }}
                placeholder="use: platform/trivy"
              />
            </div>
            <button
              type="button"
              onclick={addStep}
              class="bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm px-3 py-2 rounded-md transition-colors"
            >
              +
            </button>
          </div>
          <!-- steps serialized to JSON for form submission -->
          <input type="hidden" name="steps" value={stepsJson()} />
        </div>

        <button
          type="submit"
          disabled={creating}
          class="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          {creating ? 'Creating...' : 'Create Policy'}
        </button>
      </div>
    </form>
  {/if}

  {#if data.policies.length === 0}
    <EmptyState
      title="No policies configured"
      description="Policies inject steps into pipelines based on match criteria"
    />
  {:else}
    <div class="space-y-3">
      {#each data.policies as policy (policy.id)}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-2">
            <span class="font-mono text-sm text-surface-200">{policy.name}</span>
            <span class="text-[11px] text-surface-500 ml-auto">
              {policy.steps?.length ?? 0} step{(policy.steps?.length ?? 0) !== 1 ? 's' : ''}
            </span>
            <form
              method="POST"
              action="?/deletePolicy"
              use:enhance={() => {
                return async ({ result, update }) => {
                  await update()
                  if (result.type === 'success') {
                    await invalidateAll()
                  }
                }
              }}
            >
              <input type="hidden" name="policyId" value={policy.id} />
              <button
                type="submit"
                class="text-err-400 hover:text-err-300 text-xs transition-colors"
              >
                remove
              </button>
            </form>
          </div>
          {#if policy.description}
            <p class="text-xs text-surface-500 mb-2">{policy.description}</p>
          {/if}
          <div class="flex gap-2 flex-wrap">
            {#each matchTags(policy) as tag}
              <span class="text-[11px] bg-policy-400/10 text-policy-400 px-2 py-0.5 rounded font-mono">
                {tag}
              </span>
            {/each}
          </div>
          {#if policy.steps && policy.steps.length > 0}
            <div class="mt-3 pt-3 border-t border-surface-800">
              <p class="text-[11px] text-surface-600 mb-1.5">Injected steps</p>
              <div class="space-y-1">
                {#each policy.steps as step}
                  <div class="flex items-center gap-2 text-xs text-surface-400">
                    <span class="text-policy-400">{step.position}</span>
                    <span class="font-mono">{step.name}</span>
                    {#if step.use}
                      <span class="text-surface-600">use:</span>
                      <span class="font-mono">{step.use}</span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
