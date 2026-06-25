<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import type { PageData, ActionData } from './$types'

  type TStep = {
    name: string
    image: string
    run: string
    description?: string
    defaults?: Record<string, string>
    cache?: string[]
  }

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let showRegisterForm = $state(false)
  let registering = $state(false)
  let newName = $state('')
  let newDescription = $state('')
  let newImage = $state('')
  let newRun = $state('')
  let newDefaults = $state('')
  let newCache = $state('')

  function formatDefaults(defaults?: Record<string, string>): string {
    if (!defaults) return ''
    return JSON.stringify(defaults)
  }

  function formatCache(cache?: string[]): string {
    if (!cache || cache.length === 0) return ''
    return cache.join(', ')
  }
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-surface-200">Step Registry</h2>
    <button
      onclick={() => { showRegisterForm = !showRegisterForm }}
      class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
    >
      {showRegisterForm ? 'Cancel' : 'Register Step'}
    </button>
  </div>

  {#if form?.error}
    <div class="mb-4 px-3 py-2 rounded-md bg-err-400/10 text-err-400 text-sm">
      {form.error}
    </div>
  {/if}

  {#if showRegisterForm}
    <form
      method="POST"
      action="?/registerStep"
      use:enhance={() => {
        registering = true
        return async ({ result, update }) => {
          registering = false
          await update({ reset: false, invalidateAll: false })
          if (result.type === 'success') {
            showRegisterForm = false
            newName = ''
            newDescription = ''
            newImage = ''
            newRun = ''
            newDefaults = ''
            newCache = ''
            await invalidateAll()
          }
        }
      }}
      class="bg-surface-900 border border-surface-800 rounded-lg p-4 mb-6 max-w-xl"
    >
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="step-name">Name</label>
          <input
            id="step-name"
            type="text"
            name="name"
            bind:value={newName}
            placeholder="node-test"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="step-description">Description</label>
          <input
            id="step-description"
            type="text"
            name="description"
            bind:value={newDescription}
            placeholder="Run Node.js tests"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="step-image">Image</label>
          <input
            id="step-image"
            type="text"
            name="image"
            bind:value={newImage}
            placeholder="node:22-alpine"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="step-run">Run Command</label>
          <input
            id="step-run"
            type="text"
            name="run"
            bind:value={newRun}
            placeholder="npm ci && npm test"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="step-defaults">Default Params (JSON)</label>
          <input
            id="step-defaults"
            type="text"
            name="defaults"
            bind:value={newDefaults}
            placeholder={'{"coverage": true}'}
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1" for="step-cache">Cache Paths (one per line)</label>
          <textarea
            id="step-cache"
            name="cache"
            bind:value={newCache}
            placeholder={"node_modules\n.npm"}
            rows="2"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono resize-none"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={registering}
          class="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          {registering ? 'Registering...' : 'Register'}
        </button>
      </div>
    </form>
  {/if}

  {#if data.steps.length === 0}
    <EmptyState
      title="No steps registered"
      description="Register reusable pipeline steps for your organization"
    />
  {:else}
    <div class="space-y-3">
      {#each data.steps as step (step.name)}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
          <div class="flex items-start justify-between mb-2">
            <div>
              <span class="font-mono text-sm text-surface-200">{step.name}</span>
              {#if step.description}
                <p class="text-xs text-surface-500 mt-1">{step.description}</p>
              {/if}
            </div>
            <form
              method="POST"
              action="?/deleteStep"
              use:enhance={() => {
                return async ({ result, update }) => {
                  await update()
                  if (result.type === 'success') {
                    await invalidateAll()
                  }
                }
              }}
            >
              <input type="hidden" name="name" value={step.name} />
              <button
                type="submit"
                class="text-err-400 hover:text-err-300 text-xs transition-colors"
              >
                remove
              </button>
            </form>
          </div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mt-3">
            <div>
              <span class="text-surface-600">image:</span>
              <span class="text-surface-400 font-mono ml-1">{step.image}</span>
            </div>
            <div>
              <span class="text-surface-600">run:</span>
              <span class="text-surface-400 font-mono ml-1">{step.run}</span>
            </div>
            {#if step.defaults}
              <div>
                <span class="text-surface-600">defaults:</span>
                <span class="text-surface-400 font-mono ml-1">{formatDefaults(step.defaults)}</span>
              </div>
            {/if}
            {#if step.cache && step.cache.length > 0}
              <div>
                <span class="text-surface-600">cache:</span>
                <span class="text-surface-400 font-mono ml-1">{formatCache(step.cache)}</span>
              </div>
            {/if}
          </div>
          <div class="mt-3 pt-3 border-t border-surface-800">
            <p class="text-[11px] text-surface-600 mb-1">Usage</p>
            <code class="text-xs text-surface-400 font-mono">use: {step.name}</code>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
