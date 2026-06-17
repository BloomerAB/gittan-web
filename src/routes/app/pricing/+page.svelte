<script lang="ts">
  const trialUrl = '/oauth/authorize?response_type=code&client_id=gittan-web&redirect_uri=https://gittan.eu/auth/callback&scope=openid+profile+email'

  const starterFeatures = [
    { name: '2 users', included: true },
    { name: '2 teams', included: true },
    { name: '10 repos', included: true },
    { name: '2,000 CI minutes/mo', included: true },
    { name: '20 GB storage', included: true },
    { name: 'SSO / OIDC', included: true },
    { name: 'Org policies', included: false },
    { name: 'Cascade pipelines', included: false },
    { name: 'Dependency graph', included: false },
    { name: 'Team templates', included: false },
    { name: 'DORA metrics', included: false },
    { name: 'Audit log', included: false },
  ]

  const teamFeatures = [
    { name: 'Unlimited users', included: true },
    { name: 'Unlimited teams', included: true },
    { name: 'Unlimited repos', included: true },
    { name: '10,000 CI minutes/mo', included: true },
    { name: '100 GB storage', included: true },
    { name: 'SSO / OIDC', included: true },
    { name: 'Org policies', included: true },
    { name: 'Cascade pipelines', included: true },
    { name: 'Dependency graph', included: true },
    { name: 'Team templates', included: true },
    { name: 'DORA metrics', included: true },
    { name: 'Audit log', included: true },
  ]

  const faqs = [
    {
      q: 'Why no per-seat pricing?',
      a: 'Per-seat pricing punishes collaboration. Adding a teammate to review code shouldn\'t cost you money. We charge per team, not per person.',
    },
    {
      q: 'Why is SSO/OIDC included on every plan?',
      a: 'SSO is a security feature, not a luxury. Gating it behind enterprise tiers forces small teams to use less secure authentication. Every Gittan plan includes OIDC.',
    },
    {
      q: 'Why are CI minutes worth more here?',
      a: 'Our CI starts in under a second with pre-pulled images and parallel DAG execution. You get more done per minute. A 10-minute GitHub Actions workflow might take 3 minutes on Gittan.',
    },
    {
      q: 'Can I try before buying?',
      a: 'Yes. Start a 14-day trial on either plan, no credit card required. The trial includes all features of the plan you choose.',
    },
  ]
</script>

<div class="max-w-5xl mx-auto px-6 py-12 space-y-16">

  <!-- Header -->
  <section class="text-center space-y-4">
    <h1 class="text-4xl font-bold text-surface-200 tracking-tight">Pricing</h1>
    <p class="text-surface-400 text-lg max-w-xl mx-auto">
      Two plans. No per-seat fees. SSO included everywhere.
    </p>
  </section>

  <!-- Plans -->
  <section class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
    <!-- Starter -->
    <div class="bg-surface-900 border border-surface-800 rounded-lg p-6 flex flex-col">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-surface-300">Starter</h2>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-bold text-surface-200">&euro;29</span>
          <span class="text-sm text-surface-500">/mo</span>
        </div>
        <p class="text-xs text-surface-500">For small teams getting started with trunk-based development.</p>
      </div>

      <ul class="mt-6 space-y-2 flex-1">
        {#each starterFeatures as feature}
          <li class="flex items-center gap-2 text-sm {feature.included ? 'text-surface-300' : 'text-surface-600 line-through'}">
            {#if feature.included}
              <span class="text-ok-400 text-xs shrink-0">&#10003;</span>
            {:else}
              <span class="text-surface-700 text-xs shrink-0">&#10005;</span>
            {/if}
            {feature.name}
          </li>
        {/each}
      </ul>

      <a
        href={trialUrl}
        class="mt-6 block text-center py-2.5 rounded border border-surface-700 text-surface-300 text-sm hover:bg-surface-800 transition-colors"
      >
        Start 14-day trial
      </a>
    </div>

    <!-- Team -->
    <div class="bg-surface-900 border border-accent-900 rounded-lg p-6 flex flex-col relative">
      <div class="absolute -top-3 right-4">
        <span class="text-[10px] bg-accent-600 text-white px-2.5 py-1 rounded-full font-medium">Recommended</span>
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-accent-400">Team</h2>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-bold text-surface-200">&euro;199</span>
          <span class="text-sm text-surface-500">/mo</span>
        </div>
        <p class="text-xs text-surface-500">For teams shipping production software with org-level controls.</p>
      </div>

      <ul class="mt-6 space-y-2 flex-1">
        {#each teamFeatures as feature}
          <li class="flex items-center gap-2 text-sm text-surface-300">
            <span class="text-ok-400 text-xs shrink-0">&#10003;</span>
            {feature.name}
          </li>
        {/each}
      </ul>

      <a
        href={trialUrl}
        class="mt-6 block text-center py-2.5 rounded bg-accent-600 text-white text-sm hover:bg-accent-500 transition-colors"
      >
        Start 14-day trial
      </a>
    </div>
  </section>

  <!-- Add-ons -->
  <section class="max-w-3xl mx-auto space-y-4">
    <h2 class="text-lg font-semibold text-surface-300">Add-ons</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 flex items-start gap-4">
        <div class="space-y-1 flex-1">
          <p class="text-sm font-medium text-surface-300">CI minute block</p>
          <p class="text-xs text-surface-500">10,000 extra CI minutes per block.</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-lg font-bold text-surface-200">&euro;79</p>
          <p class="text-[10px] text-surface-500">/block/mo</p>
        </div>
      </div>
      <div class="bg-surface-900 border border-surface-800 rounded-lg p-4 flex items-start gap-4">
        <div class="space-y-1 flex-1">
          <p class="text-sm font-medium text-surface-300">Extra storage</p>
          <p class="text-xs text-surface-500">Beyond your plan's included storage.</p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-lg font-bold text-surface-200">&euro;0.02</p>
          <p class="text-[10px] text-surface-500">/GB/mo</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="max-w-3xl mx-auto space-y-6">
    <h2 class="text-lg font-semibold text-surface-300">Questions</h2>
    <div class="space-y-4">
      {#each faqs as faq}
        <div class="bg-surface-900 border border-surface-800 rounded-lg p-5 space-y-2">
          <h3 class="text-sm font-medium text-surface-300">{faq.q}</h3>
          <p class="text-xs text-surface-500 leading-relaxed">{faq.a}</p>
        </div>
      {/each}
    </div>
  </section>

</div>
