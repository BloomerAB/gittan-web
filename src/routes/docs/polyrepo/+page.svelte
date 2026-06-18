<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why we built for polyrepos"
  subtitle="Monorepos solve a tooling problem by creating a platform problem. We solved the tooling problem instead."
>
  <p>
    The monorepo trend has a seductive pitch: put everything in one repo and you get
    atomic changes across services, a single CI pipeline, shared tooling, and no
    dependency versioning. Google does it. Meta does it. It must be the right approach.
  </p>

  <p>
    It is not. Or rather — it is the right approach if you are Google or Meta, with
    dedicated teams building custom VCS tooling, custom build systems, and custom CI
    infrastructure. For everyone else, a monorepo trades one set of problems for a
    worse set.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The monorepo tax</h2>

  <p>
    A monorepo with 20 services needs a build system that understands which services
    are affected by a change. That means Bazel, Nx, Turborepo, or a custom solution.
    These tools are complex. They have configuration files, caching strategies, dependency
    graphs, and their own failure modes. The team that was supposed to be shipping
    product is now debugging why Bazel's remote cache returned a stale artifact.
  </p>

  <p>
    Git itself struggles. Clone times grow. Checkout is slow. Blame takes seconds instead
    of milliseconds. Partial clone and sparse checkout help, but they are workarounds for
    a problem that does not exist with smaller repos. You are fighting the version control
    system instead of using it.
  </p>

  <p>
    CI becomes a bottleneck. A change to a shared library triggers builds for every
    consumer. If the build system's change detection is wrong — and it will be, eventually
    — you either rebuild everything (slow) or miss an affected service (broken). A flaky
    test in one team's directory blocks every other team from merging. The monorepo that
    was supposed to simplify CI has made it everyone's problem.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The platform engineering perspective</h2>

  <p>
    If you work in platform engineering, you see the monorepo from the other side. You
    are the team that has to make it work. You maintain the build system config. You
    debug the CI pipeline when it takes 45 minutes. You handle the merge queue when 15
    teams are trying to land changes on the same branch. You write the custom tooling
    that makes a 500-service monorepo usable.
  </p>

  <p>
    This is a full-time job. Not a side project, not a part-time responsibility — a
    dedicated platform team maintaining the monorepo infrastructure. That is the hidden
    cost. The teams using the monorepo see simplicity. The platform team sees a system
    that requires constant maintenance to keep from collapsing under its own weight.
  </p>

  <p>
    Most companies do not have a dedicated monorepo platform team. They have a few
    engineers who "also handle CI." The result is a monorepo that works adequately until
    it does not, and then nobody knows how to fix it because the tooling is too complex
    for part-time maintenance.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What polyrepos actually need</h2>

  <p>
    The legitimate problems that monorepos solve are:
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Cross-repo dependency testing</strong> — when a shared library changes, consumers should be tested.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Visibility into dependencies</strong> — you need to know what depends on what.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Consistent CI across services</strong> — teams should not reinvent pipeline config for every repo.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Shared policies</strong> — security scanning, license checks, and image signing should apply everywhere.</span>
    </li>
  </ul>

  <p>
    These are real problems. But they are tooling problems, not repository structure
    problems. You do not need to put all code in one repo to solve them. You need a
    platform that understands relationships between repos.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">How gittan solves them</h2>

  <p>
    <strong class="text-surface-300">Cascade pipelines</strong> handle cross-repo testing.
    Declare a dependency, and when the upstream repo passes its pipeline, downstream
    repos are tested automatically. The dependency graph is explicit, not inferred from
    a build system.
  </p>

  <p>
    <strong class="text-surface-300">The dependency graph</strong> is visible in the UI.
    You can see which repos depend on which, trace the cascade path, and understand the
    blast radius of a change. This is the same information a monorepo's build graph
    provides, but across separate repos.
  </p>

  <p>
    <strong class="text-surface-300">Team templates</strong> provide consistent CI without
    copy-pasting config. A team defines their pipeline steps once, and every repo in the
    team inherits them. Changes to the template apply to all repos immediately.
  </p>

  <p>
    <strong class="text-surface-300">Org policies</strong> inject security scanning, license
    compliance, and image signing into every pipeline in the organization. No repo can
    opt out. The platform team controls the policies centrally.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The benefits you keep</h2>

  <p>
    With polyrepos you get things that monorepos make hard:
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span><strong class="text-surface-300">Clear ownership</strong> — each repo belongs to one team. No directory-level ACLs, no "who owns this folder."</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span><strong class="text-surface-300">Independent deployment</strong> — a team deploys their service without coordinating with every other team in the repo.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span><strong class="text-surface-300">Fast git operations</strong> — small repos clone, checkout, and blame in milliseconds. No sparse checkout hacks.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span><strong class="text-surface-300">Isolated CI</strong> — a flaky test in one repo does not block another team. A broken build does not create a merge queue.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span><strong class="text-surface-300">No specialized tooling</strong> — standard git, standard containers, no Bazel configs to maintain.</span>
    </li>
  </ul>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">You can still use a monorepo</h2>

  <p>
    Nothing in gittan prevents you from putting all your code in one repo. The pipeline
    runs, the gated push works, the policies apply. If your team wants a monorepo, it
    will work.
  </p>

  <p>
    But gittan is not optimized for it. There is no built-in change detection to figure
    out which service in the repo was affected. There is no Bazel integration. The
    cascade pipeline feature — one of gittan's strongest tools — only makes sense across
    repos, not within one. The dependency graph, the team-per-repo ownership model, the
    per-repo DORA metrics — all of these assume that one repo is one deployable thing
    owned by one team.
  </p>

  <p>
    We built for the model we believe in. If you share that belief, gittan will feel
    natural. If you are committed to a monorepo, you will be underusing the platform.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The right abstraction</h2>

  <p>
    A monorepo puts the abstraction boundary at the repo level: everything inside is one
    unit. This works at Google because Google built the tooling to make it work. For
    everyone else, it means fighting git, fighting CI, and fighting the build system to
    maintain an abstraction that the tooling does not natively support.
  </p>

  <p>
    Polyrepos put the abstraction boundary at the service level: each service is its own
    unit, with its own repo, its own pipeline, and its own team. The relationships
    between services are explicit, managed by the platform, and tested through cascade
    pipelines. No custom build system required.
  </p>

  <p>
    Monorepos are a workaround for platforms that do not understand cross-repo
    relationships. gittan understands them. That makes the workaround unnecessary.
  </p>
</Article>
