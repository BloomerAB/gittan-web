<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Your git host should not have incident pages"
  subtitle="GitHub has had more outages in the last two years than we have had deployments that failed."
>
  <p>
    Check <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">githubstatus.com</code>
    on any given month. You will find degraded performance on Actions, git operations
    failing, webhook delays, API errors, or full outages affecting push and pull. This is
    not a rare event. It is a pattern. The platform that most of the world's software
    depends on is unreliable — and the industry has normalized it.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The cost of an outage</h2>

  <p>
    When GitHub is down, your team cannot push. They cannot merge. CI does not run.
    Deployments stall. Depending on how tightly you have integrated GitHub into your
    workflow — Actions for CI, Packages for registries, Copilot for development — an
    outage can stop your entire engineering organization.
  </p>

  <p>
    This is not a minor inconvenience. If your deployment process requires a push to
    GitHub to trigger a pipeline, and GitHub is down for two hours on a Tuesday afternoon,
    that is two hours of zero deployments across every team. A critical hotfix sits on
    someone's laptop, waiting for a platform they do not control to come back online.
  </p>

  <p>
    The irony is that these are the same platforms that sell you uptime SLAs and
    enterprise support contracts. The SLA promises 99.9% uptime. The status page tells
    a different story.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why large forges are unstable</h2>

  <p>
    GitHub, GitLab, and Bitbucket are massive platforms that do many things. They host
    git repos, run CI, serve packages, manage issues, render wikis, run Codespaces,
    serve Pages, process webhooks, handle OAuth flows, manage marketplace apps, and
    more. Every feature is a surface that can fail.
  </p>

  <p>
    Feature bloat is not just a UX problem — it is a reliability problem. Every
    additional system adds failure modes, increases the blast radius of infrastructure
    issues, and makes incident response harder. When Actions goes down, it often takes
    webhook delivery with it, which breaks external CI systems that depend on GitHub
    events. The failures cascade because the systems are coupled.
  </p>

  <p>
    These platforms also serve hundreds of millions of repositories. The operational
    complexity of running git hosting at that scale, with that many features, for that
    many users, is staggering. It is not surprising that things break. It would be
    surprising if they did not.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Smaller surface, fewer failures</h2>

  <p>
    Gittan does three things: git hosting, pipelines, and team management. There are no
    package registries, no wikis, no Codespaces, no marketplace, no social features, no
    Pages. The operational surface is small because the product surface is small.
  </p>

  <p>
    Fewer features means fewer things that can break. Fewer integrations means fewer
    cascade failures. Fewer users per node means less contention. This is not clever
    engineering — it is arithmetic. A system that does less has less to go wrong.
  </p>

  <p>
    Our infrastructure is purpose-built for the workloads we run. Git storage is
    separate from pipeline execution. Pipeline failures do not affect git operations.
    A slow pipeline does not block a push to a different repo. The components are
    isolated because we designed for it from the start, not bolted it on after the
    third major outage.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">An honest starting point</h2>

  <p>
    Gittan is a new product. We are not claiming five-nines uptime on day one. Every
    system has teething problems, and ours will too. We would be lying if we said
    otherwise.
  </p>

  <p>
    What we do have is a structural advantage. A small, focused product with fewer
    features is fundamentally simpler to operate. There are fewer components to monitor,
    fewer interactions to go wrong, fewer edge cases to handle during an incident. Our
    team understands every part of the system because the system is small enough to
    understand.
  </p>

  <p>
    A platform that does ten things needs ten times the operational knowledge to keep
    running. When something breaks at 3 AM, the on-call engineer has to figure out which
    of those ten systems failed and how it affects the others. When something breaks in
    a system that does three things, the blast radius is smaller and the diagnosis is
    faster.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Your tools should be boring</h2>

  <p>
    A git host should be invisible. You push, it works. You pull, it works. The pipeline
    runs, it gives you results. You never think about it. That is the ambition — not
    because we are there today, but because the architecture makes it achievable.
  </p>

  <p>
    A system that does less has less to go wrong. That is not a marketing claim. It is
    the reason we keep the feature set small. Every feature we do not build is a failure
    mode we do not have. Every integration we do not ship is a dependency that cannot
    take us down. Reliability is not just an ops practice — it is a product decision.
  </p>
</Article>
