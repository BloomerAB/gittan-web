<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Teams own everything. Individuals own nothing."
  subtitle="There is no personal namespace in gittan. Code belongs to teams, because that is how quality happens."
>
  <p>
    On GitHub, your profile page shows your repos, your contributions, your activity
    graph. Code lives under your username. You fork repos into your personal namespace.
    Your identity as a developer is tied to your individual output.
  </p>

  <p>
    gittan has none of this. There are no personal namespaces. No user profiles with
    activity graphs. No individual contribution metrics. Every repo belongs to a team.
    Every push is a team activity. The individual is a member of a team, not an
    independent actor.
  </p>

  <p>
    This is not an oversight. It is the core of the product.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why team ownership produces better software</h2>

  <p>
    When an individual owns a repo, they become a bottleneck. They know the code best.
    They review all the changes. They are the person you ask when something breaks. When
    they go on vacation, progress stops. When they leave the company, knowledge leaves
    with them.
  </p>

  <p>
    This is the "bus factor" problem, and it is not hypothetical — it happens in every
    organization that lets individuals own code. The owner becomes a single point of
    failure. The team learns to route around them instead of sharing ownership.
  </p>

  <p>
    When a team owns a repo, knowledge is distributed by default. Multiple people push
    to the same codebase. Multiple people know how it works. When someone is unavailable,
    the team continues. There is no hero developer whose absence blocks everyone.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">No individual metrics</h2>

  <p>
    gittan does not track individual contributions. There is no "lines of code per
    developer." No "commits per week." No activity heatmap on a personal profile. These
    metrics are not just useless — they are actively harmful.
  </p>

  <p>
    The Accelerate research is clear: measuring individual developer productivity does
    not predict team performance. Worse, when managers use individual metrics to evaluate
    performance, developers optimize for the metric instead of for outcomes. They split
    commits to inflate counts. They avoid refactoring because it shows as negative lines.
    They push trivial changes to keep the activity graph green.
  </p>

  <p>
    gittan tracks team metrics: deployment frequency, lead time, change failure rate,
    time to restore. These are the DORA metrics — they predict team performance and they
    cannot be gamed by a single individual inflating their numbers. A team that deploys
    frequently with low failure rates is performing well. It does not matter who wrote
    which line.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Permissions follow teams</h2>

  <p>
    Access in gittan is team-based. You are a member of a team. The team has repos. You
    have access to those repos. There is no per-user repo access, no individual
    collaborator invitations, no "give this one person write access to this one repo."
  </p>

  <p>
    Team membership comes from your identity provider's groups claim. When your IdP says
    you are in the "payments" group, you get access to the payments team's repos in
    gittan. When you are removed from the group, access is revoked. No manual management.
    No access reviews. No "who has access to what" audits — your IdP is the source of
    truth.
  </p>

  <p>
    This eliminates an entire category of security problems. There are no stale personal
    access grants. There are no repos that only one person can access. There is no
    scenario where someone leaves and you discover they were the only person with write
    access to a critical service.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Collective code ownership</h2>

  <p>
    Extreme Programming introduced the concept of collective code ownership: all code is
    owned by the whole team, and anyone on the team can change any part of it. This
    practice predates both the DORA research and Team Topologies, and both frameworks
    validate it — shared ownership reduces bottlenecks, increases knowledge distribution,
    and improves quality.
  </p>

  <p>
    gittan's permission model makes collective code ownership the default, not an
    aspiration. You cannot set up individual ownership because the concept does not exist
    in the system. Every team member has the same access to every repo the team owns.
    The code is the team's responsibility, not any one person's.
  </p>

  <p>
    This also changes how people think about code quality. When your name is not on the
    repo, you do not feel defensive about feedback. When anyone can push a fix, problems
    get fixed faster. When the team's metrics reflect the team's work, collaboration is
    the natural response — not territory.
  </p>
</Article>
