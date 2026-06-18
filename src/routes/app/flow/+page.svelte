<script lang="ts">
  let activeLayer = $state<'org' | 'team' | 'repo'>('org')

  const layers = [
    {
      id: 'org' as const,
      label: 'Org policy',
      badge: 'Injected',
      badgeColor: 'bg-policy-500',
      description: 'Security gates, license scanning, image signing. Teams cannot remove these steps.',
      example: `# org-policy.yaml (managed by platform team)
steps:
  - name: license-check
    image: gittan/license-scanner:20260601
    enforced: true
  - name: sign-image
    image: gittan/cosign:20260601
    enforced: true`,
    },
    {
      id: 'team' as const,
      label: 'Team template',
      badge: 'Defaults',
      badgeColor: 'bg-accent-600',
      description: 'Shared CI steps across all repos in a team. Repos inherit these unless overridden.',
      example: `# team-template.yaml
steps:
  - name: lint
    image: node:22-slim
    run: pnpm lint
  - name: test
    image: node:22-slim
    run: pnpm test
  - name: build
    image: node:22-slim
    run: pnpm build`,
    },
    {
      id: 'repo' as const,
      label: '.gittan.yaml',
      badge: 'Repo-specific',
      badgeColor: 'bg-ok-500',
      description: 'Per-repo overrides. Add steps, customize images, define DAG dependencies.',
      example: `# .gittan.yaml
steps:
  - name: e2e
    image: playwright:20260601
    run: pnpm test:e2e
    needs: [build]
  - name: deploy-preview
    image: gittan/deploy:20260601
    run: deploy --preview
    needs: [e2e]`,
    },
  ]

  const terminalLines = [
    { text: '$ git push origin main', color: 'text-surface-300', delay: 0 },
    { text: 'remote: gittan pipeline started', color: 'text-surface-500', delay: 1 },
    { text: 'remote: ', color: 'text-surface-500', delay: 2 },
    { text: 'remote: [license-check] running...', color: 'text-policy-400', delay: 2 },
    { text: 'remote: [license-check] passed (0.4s)', color: 'text-ok-400', delay: 3 },
    { text: 'remote: [lint]          running...', color: 'text-accent-400', delay: 3 },
    { text: 'remote: [test]          running...', color: 'text-accent-400', delay: 3 },
    { text: 'remote: [lint]          passed (1.2s)', color: 'text-ok-400', delay: 4 },
    { text: 'remote: [test]          passed (3.8s)', color: 'text-ok-400', delay: 5 },
    { text: 'remote: [build]         running...', color: 'text-accent-400', delay: 5 },
    { text: 'remote: [build]         passed (2.1s)', color: 'text-ok-400', delay: 6 },
    { text: 'remote: [sign-image]    running...', color: 'text-policy-400', delay: 6 },
    { text: 'remote: [sign-image]    passed (0.3s)', color: 'text-ok-400', delay: 7 },
    { text: 'remote: ', color: 'text-surface-500', delay: 7 },
    { text: 'remote: Pipeline passed (7.8s total)', color: 'text-ok-400', delay: 8 },
    { text: 'remote: main updated: a1b2c3d..f4e5d6a', color: 'text-surface-300', delay: 8 },
    { text: 'To gittan.eu:acme/api-service.git', color: 'text-surface-500', delay: 9 },
    { text: '   a1b2c3d..f4e5d6a  main -> main', color: 'text-surface-300', delay: 9 },
  ]

  const githubSteps = [
    'Create feature branch',
    'Push branch to remote',
    'Open pull request',
    'Wait for CI to start (~90s)',
    'CI runs, review requested',
    'Wait for reviewer',
    'Address review comments',
    'Re-request review',
    'Get approval',
    'Merge PR',
    'Delete branch',
  ]

  const cascadeRepos = [
    { name: 'api-service', status: 'passed', time: '12.3s' },
    { name: 'runner', status: 'passed', time: '8.7s' },
    { name: 'web', status: 'passed', time: '15.1s' },
  ]
</script>

<div class="max-w-5xl mx-auto px-6 py-12 space-y-20">

  <!-- Speed hero -->
  <section class="text-center space-y-6">
    <h1 class="text-4xl font-bold text-surface-200 tracking-tight">How gittan works</h1>
    <p class="text-surface-400 text-lg max-w-2xl mx-auto">
      Push code. Pipeline runs. Results stream to your terminal. No tabs, no waiting, no ceremony.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-3xl mx-auto">
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-6 space-y-3">
        <p class="text-[11px] uppercase tracking-wider text-surface-500">GitHub Actions</p>
        <p class="text-4xl font-bold text-err-400">~90s</p>
        <p class="text-sm text-surface-500">overhead before your code even starts running</p>
        <ul class="text-xs text-surface-600 space-y-1 text-left pt-2 border-t border-surface-800">
          <li>Provision VM from scratch</li>
          <li>Pull Docker images every run</li>
          <li>Install dependencies every run</li>
          <li>Sequential step execution</li>
        </ul>
      </div>
      <div class="bg-surface-900 border border-accent-900 rounded-lg p-6 space-y-3">
        <p class="text-[11px] uppercase tracking-wider text-accent-400">gittan</p>
        <p class="text-4xl font-bold text-accent-400">&lt;1s</p>
        <p class="text-sm text-surface-500">from push to first step executing</p>
        <ul class="text-xs text-surface-600 space-y-1 text-left pt-2 border-t border-surface-800">
          <li>Pre-pulled images, warm runners</li>
          <li>Sub-second container start</li>
          <li>Layer caching across runs</li>
          <li>Parallel DAG execution</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Pipeline flow diagram -->
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold text-surface-200">Pipeline flow</h2>
    <p class="text-surface-500 text-sm">What happens when you run <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">git push origin main</code></p>

    <div class="bg-surface-900 border border-surface-800 rounded-lg p-6 overflow-x-auto">
      <div class="flex items-start gap-3 min-w-[700px]">
        <!-- git push -->
        <div class="flex flex-col items-center gap-1 shrink-0">
          <div class="w-24 h-12 rounded border border-surface-700 bg-surface-800 flex items-center justify-center text-xs text-surface-300 font-mono">git push</div>
        </div>
        <div class="flex items-center h-12 text-surface-600 shrink-0">&rarr;</div>

        <!-- gated? -->
        <div class="flex flex-col items-center gap-1 shrink-0">
          <div class="w-24 h-12 rounded border border-policy-400 bg-surface-800 flex items-center justify-center text-xs text-policy-400 rotate-0">
            <div class="transform rotate-0">gated?</div>
          </div>
        </div>
        <div class="flex items-center h-12 text-surface-600 shrink-0">&rarr;</div>

        <!-- pipeline runs -->
        <div class="flex flex-col items-center gap-1 shrink-0">
          <div class="w-28 h-12 rounded border border-accent-600 bg-surface-800 flex items-center justify-center text-xs text-accent-400 font-mono">pipeline runs</div>
        </div>
        <div class="flex items-center h-12 text-surface-600 shrink-0">&rarr;</div>

        <!-- green? -->
        <div class="flex flex-col items-center gap-1 shrink-0">
          <div class="w-24 h-12 rounded border border-ok-400 bg-surface-800 flex items-center justify-center text-xs text-ok-400">green?</div>
        </div>

        <!-- branches -->
        <div class="flex flex-col gap-2 shrink-0 ml-3">
          <div class="flex items-center gap-3">
            <span class="text-ok-400 text-xs">yes &rarr;</span>
            <div class="w-32 h-10 rounded border border-ok-400 bg-surface-800 flex items-center justify-center text-xs text-ok-400 font-mono">main updated</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-err-400 text-xs">no&nbsp; &rarr;</span>
            <div class="w-32 h-10 rounded border border-err-400 bg-surface-800 flex items-center justify-center text-xs text-err-400 font-mono">push rejected</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- GitHub vs gittan -->
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold text-surface-200">GitHub vs gittan</h2>
    <p class="text-surface-500 text-sm">Ship a change to main.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-5 space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-surface-400">GitHub</p>
          <span class="text-[10px] bg-surface-800 text-surface-500 px-2 py-0.5 rounded-full">11 steps</span>
        </div>
        <ol class="text-xs text-surface-500 space-y-1.5 list-decimal list-inside">
          {#each githubSteps as step, i}
            <li class={i >= 3 && i <= 7 ? 'text-surface-600' : ''}>{step}</li>
          {/each}
        </ol>
      </div>

      <div class="bg-surface-900 border border-accent-900 rounded-lg p-5 space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-accent-400">gittan</p>
          <span class="text-[10px] bg-accent-900 text-accent-400 px-2 py-0.5 rounded-full">1 step</span>
        </div>
        <div class="mt-4 bg-surface-950 rounded p-4 font-mono text-sm text-accent-400">
          git push origin main
        </div>
        <p class="text-xs text-surface-500">
          Pipeline runs during push. If it passes, main is updated. If it fails, push is rejected. Done.
        </p>
      </div>
    </div>
  </section>

  <!-- Pipeline config layers -->
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold text-surface-200">Pipeline config layers</h2>
    <p class="text-surface-500 text-sm">Three layers merge into a single pipeline. Org policies are enforced, team templates provide defaults, repos can add their own steps.</p>

    <div class="flex gap-2">
      {#each layers as layer}
        <button
          onclick={() => activeLayer = layer.id}
          class="px-3 py-1.5 rounded text-xs transition-colors {activeLayer === layer.id
            ? 'bg-surface-800 text-surface-200'
            : 'text-surface-500 hover:text-surface-400'}"
        >
          <span class="inline-block w-2 h-2 rounded-full {layer.badgeColor} mr-1.5"></span>
          {layer.label}
        </button>
      {/each}
    </div>

    {#each layers as layer}
      {#if activeLayer === layer.id}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-5 space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-[10px] px-2 py-0.5 rounded-full {layer.badgeColor} text-white">{layer.badge}</span>
            <h3 class="text-sm font-semibold text-surface-300">{layer.label}</h3>
          </div>
          <p class="text-xs text-surface-500">{layer.description}</p>
          <pre class="bg-surface-950 rounded p-4 text-xs text-surface-400 font-mono overflow-x-auto whitespace-pre">{layer.example}</pre>
        </div>
      {/if}
    {/each}
  </section>

  <!-- Cross-repo cascade -->
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold text-surface-200">Cross-repo cascade</h2>
    <p class="text-surface-500 text-sm">When a shared dependency passes, downstream repos are automatically tested.</p>

    <div class="bg-surface-900 border border-surface-800 rounded-lg p-6">
      <div class="flex flex-col items-center gap-4">
        <!-- Source repo -->
        <div class="flex items-center gap-3">
          <div class="w-40 h-12 rounded border border-ok-400 bg-surface-800 flex items-center justify-center text-sm text-ok-400 font-mono">shared-types</div>
          <span class="text-ok-400 text-xs">passed</span>
        </div>

        <!-- Arrow down -->
        <div class="text-surface-600 text-sm">&darr; triggers</div>

        <!-- Downstream repos -->
        <div class="flex gap-4 flex-wrap justify-center">
          {#each cascadeRepos as repo}
            <div class="flex items-center gap-2">
              <div class="w-32 h-10 rounded border border-surface-700 bg-surface-800 flex items-center justify-center text-xs text-surface-300 font-mono">{repo.name}</div>
              <span class="text-ok-400 text-[10px]">{repo.time}</span>
            </div>
          {/each}
        </div>

        <!-- Summary -->
        <p class="text-xs text-surface-500 mt-2">All 3 downstream repos passed. Dependency graph is safe.</p>
      </div>
    </div>
  </section>

  <!-- Terminal feedback -->
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold text-surface-200">Terminal feedback</h2>
    <p class="text-surface-500 text-sm">Pipeline results stream to your terminal during <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">git push</code>. No browser needed.</p>

    <div class="bg-surface-950 border border-surface-800 rounded-lg overflow-hidden">
      <div class="flex items-center gap-1.5 px-4 py-2 border-b border-surface-800">
        <div class="w-2.5 h-2.5 rounded-full bg-err-500"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-accent-500"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-ok-500"></div>
        <span class="text-[10px] text-surface-600 ml-2">terminal</span>
      </div>
      <div class="p-4 font-mono text-xs space-y-0.5 leading-relaxed">
        {#each terminalLines as line}
          <div class="{line.color}">{line.text}</div>
        {/each}
      </div>
    </div>
  </section>

</div>
