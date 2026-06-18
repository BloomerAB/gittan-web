<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Cascade pipelines: monorepo safety without the monorepo"
  subtitle="When a shared dependency passes, downstream repos are tested automatically."
>
  <p>
    The monorepo argument usually goes like this: if all your code is in one repo, you can
    test everything together. Change a shared library, and every consumer is tested in the
    same CI run. You catch breaking changes before they ship. This is true. It is also
    expensive — monorepos need specialized tooling to avoid rebuilding the world on every
    commit.
  </p>

  <p>
    The alternative — separate repos per service — gives you simplicity and clear ownership,
    but breaks the dependency safety net. You change a shared library, push it, and hope
    that the five services that depend on it still work. You find out they do not when
    someone else pushes their service and their build fails on your change. By then, you
    have moved on to something else.
  </p>

  <p>
    Gittan solves this without a monorepo.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">How cascade pipelines work</h2>

  <p>
    When you declare that repo B depends on repo A, Gittan records the relationship in a
    dependency graph. When a push to repo A passes its pipeline, Gittan automatically
    triggers pipelines for every repo that depends on A — in this case, repo B.
  </p>

  <p>
    If repo B's pipeline passes, the cascade is green. If it fails, the team that owns
    repo B gets notified. The change in repo A is not rolled back — it passed its own
    pipeline. But the downstream failure is surfaced immediately, not discovered days later
    by accident.
  </p>

  <p>
    The cascade follows the full dependency graph. If repo C depends on repo B, and repo B
    depends on repo A, a change to repo A triggers B, and if B passes, triggers C. The
    depth is unlimited. The width is unlimited. If your shared-types repo is consumed by
    20 services, all 20 are tested when shared-types changes.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why not a monorepo</h2>

  <p>
    Monorepos solve the dependency problem by putting everything in one place. But they
    create a new set of problems:
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Tooling overhead</strong> — you need Bazel, Nx, Turborepo, or similar to avoid rebuilding everything on every change. These tools are complex to configure and maintain.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Unclear ownership</strong> — when everything is in one repo, it is harder to enforce who owns what. Permission boundaries become directory-level ACLs instead of repo-level isolation.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">CI contention</strong> — a broken test in one team's directory can block the entire repo's pipeline. Teams that have nothing to do with the failure are blocked from merging.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Git performance</strong> — large monorepos push Git to its limits. Clone times, checkout times, and blame operations slow down as the repo grows. Partial clone and sparse checkout help but add complexity.</span>
    </li>
  </ul>

  <p>
    Separate repos have none of these problems. Each repo is small, fast, and owned by
    one team. Permissions are repo-level. CI runs are scoped to the repo. Git operations
    are fast because the repo is small. The only thing you lose is cross-repo dependency
    testing — and cascade pipelines give that back.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The dependency graph</h2>

  <p>
    Gittan maintains a dependency graph across all repos in an org. The graph is visible
    in the web UI — you can see which repos depend on which, and trace the cascade path
    for any change.
  </p>

  <p>
    Dependencies are declared in the repo's pipeline config. A team adds
    <code class="text-accent-400 bg-surface-900 px-1.5 py-0.5 rounded text-xs">depends_on: [shared-types]</code>
    to their config, and Gittan registers the relationship. When shared-types passes, their
    repo is queued for a cascade run.
  </p>

  <p>
    The graph also surfaces architectural information that is otherwise invisible. You can
    see which repos are the most depended-on, which teams are affected by a change to a
    shared library, and where circular dependencies exist. This is information that
    monorepos have implicitly — through their build graph — but that separate repos
    typically lack entirely.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Cascade runs are fast</h2>

  <p>
    A cascade run uses the same infrastructure as a normal pipeline. Images are pre-pulled,
    runners are warm, steps execute in parallel. The cascade does not re-clone or
    re-provision anything. It runs the downstream repo's pipeline against its current main
    branch with the updated dependency.
  </p>

  <p>
    For a repo with 5 downstream dependents, the cascade typically completes in the time
    it takes the slowest downstream pipeline to run — because they all run in parallel.
    You pushed shared-types, and 30 seconds later you know whether all downstream repos
    are still green.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The best of both worlds</h2>

  <p>
    Monorepos exist because cross-repo dependency testing is important. We agree. We just
    disagree that everything needs to be in one repository to achieve it. Cascade pipelines
    give you the dependency safety of a monorepo with the simplicity, ownership clarity,
    and performance of separate repos.
  </p>
</Article>
