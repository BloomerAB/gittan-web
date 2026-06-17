<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte'

  type TStep = {
    id: string
    name: string
    description: string
    image: string
    run: string
    defaults: string
    cache: string
  }

  let showRegisterForm = $state(false)
  let steps = $state<TStep[]>([])

  let newName = $state('')
  let newDescription = $state('')
  let newImage = $state('')
  let newRun = $state('')
  let newDefaults = $state('')
  let newCache = $state('')

  function registerStep() {
    if (!newName || !newImage) return
    const step: TStep = {
      id: crypto.randomUUID(),
      name: newName,
      description: newDescription,
      image: newImage,
      run: newRun,
      defaults: newDefaults,
      cache: newCache,
    }
    steps = [...steps, step]
    newName = ''
    newDescription = ''
    newImage = ''
    newRun = ''
    newDefaults = ''
    newCache = ''
    showRegisterForm = false
  }

  function loadExamples() {
    steps = [
      {
        id: 'ex-node-test',
        name: 'node/test',
        description: 'Run Node.js tests with coverage',
        image: 'node:22-alpine',
        run: 'npm ci && npm test',
        defaults: '{"coverage": true, "timeout": 60}',
        cache: 'node_modules,.npm',
      },
      {
        id: 'ex-platform-trivy',
        name: 'platform/trivy',
        description: 'Container image vulnerability scanner',
        image: 'aquasec/trivy:latest',
        run: 'trivy image --exit-code 1 --severity HIGH,CRITICAL $IMAGE',
        defaults: '{"severity": "HIGH,CRITICAL", "exitCode": 1}',
        cache: '/root/.cache/trivy',
      },
    ]
  }
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-surface-200">Step Registry</h2>
    <div class="flex gap-2">
      {#if steps.length === 0}
        <button
          onclick={loadExamples}
          class="bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm px-4 py-2 rounded-md transition-colors"
        >
          Load Examples
        </button>
      {/if}
      <button
        onclick={() => { showRegisterForm = !showRegisterForm }}
        class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
      >
        {showRegisterForm ? 'Cancel' : 'Register Step'}
      </button>
    </div>
  </div>

  {#if showRegisterForm}
    <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 mb-6 max-w-xl">
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-surface-500 mb-1">Name</label>
          <input
            type="text"
            bind:value={newName}
            placeholder="node/test"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1">Description</label>
          <input
            type="text"
            bind:value={newDescription}
            placeholder="Run Node.js tests"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1">Image</label>
          <input
            type="text"
            bind:value={newImage}
            placeholder="node:22-alpine"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1">Run Command</label>
          <input
            type="text"
            bind:value={newRun}
            placeholder="npm ci && npm test"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1">Default Params (JSON)</label>
          <input
            type="text"
            bind:value={newDefaults}
            placeholder={'{"coverage": true}'}
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none font-mono"
          />
        </div>
        <div>
          <label class="block text-xs text-surface-500 mb-1">Cache Paths (comma-separated)</label>
          <input
            type="text"
            bind:value={newCache}
            placeholder="node_modules,.npm"
            class="w-full bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          />
        </div>
        <button
          onclick={registerStep}
          class="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          Register
        </button>
      </div>
    </div>
  {/if}

  {#if steps.length === 0}
    <EmptyState
      title="No steps registered"
      description="Register reusable pipeline steps for your organization"
    />
  {:else}
    <div class="space-y-3">
      {#each steps as step}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-4">
          <div class="flex items-start justify-between mb-2">
            <div>
              <span class="font-mono text-sm text-surface-200">{step.name}</span>
              {#if step.description}
                <p class="text-xs text-surface-500 mt-1">{step.description}</p>
              {/if}
            </div>
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
                <span class="text-surface-400 font-mono ml-1">{step.defaults}</span>
              </div>
            {/if}
            {#if step.cache}
              <div>
                <span class="text-surface-600">cache:</span>
                <span class="text-surface-400 font-mono ml-1">{step.cache}</span>
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
