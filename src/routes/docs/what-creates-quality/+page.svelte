<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="What actually creates software quality"
  subtitle="The research is clear. Most of the industry ignores it."
>
  <p>
    Software quality is not a mystery. Decades of research — from Accelerate and the DORA
    program, from the State of DevOps reports, from studies on lean manufacturing applied
    to software, from Extreme Programming's original research — consistently point to the
    same set of practices. They are not complicated. They are not new. And most
    organizations still do not follow them.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Small batches</h2>

  <p>
    The single strongest predictor of software quality is batch size. Small changes are
    easier to understand, easier to review, easier to test, and easier to revert. When
    something breaks, the blast radius is small and the cause is obvious.
  </p>

  <p>
    Large changes are the opposite. They are hard to review — studies show that review
    quality drops significantly after 200 lines of diff. They are hard to test because
    they touch multiple systems. They are hard to revert because other changes have been
    built on top. When they break, diagnosing the cause takes hours.
  </p>

  <p>
    Every practice that encourages large batches — long-lived branches, heavy PR processes,
    infrequent deployments — works against quality. Every practice that encourages small
    batches — trunk-based development, continuous integration, fast feedback — works for it.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Fast feedback</h2>

  <p>
    The time between writing code and learning whether it works is the most important
    variable in software development. When feedback is fast — seconds to minutes — the
    developer's mental model of the change is still fresh. They can fix issues immediately.
    The cost of a mistake is low.
  </p>

  <p>
    When feedback is slow — hours to days — the developer has moved on. They are working
    on something else. Context-switching back to the original change is expensive. They
    have to re-read the code, reconstruct their reasoning, and figure out what went wrong.
    The cost of a mistake is high.
  </p>

  <p>
    This is not about developer comfort. The Accelerate research shows that teams with
    fast feedback loops have lower change failure rates. Fast feedback catches problems
    early, when they are cheap to fix. Slow feedback catches them late, when they are
    expensive to fix.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Continuous integration</h2>

  <p>
    Continuous integration means every change is integrated into the main branch and
    tested against all other changes as soon as it is written. Not at the end of a
    sprint. Not when a PR is approved. Continuously.
  </p>

  <p>
    The benefit is that integration problems are caught when they are created, not
    accumulated. Two developers changing the same interface find the conflict on the
    first push, not after two weeks of parallel work on separate branches. The cost of
    resolving the conflict is minutes, not days.
  </p>

  <p>
    This requires that the main branch is always in a working state. Which requires that
    every push is tested before it is accepted. Which is exactly what gated push does.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Team ownership</h2>

  <p>
    The research consistently shows that teams with clear ownership produce better
    software. When a team owns a service — its code, its pipeline, its deployment, its
    on-call — they have both the authority and the accountability to keep it healthy.
  </p>

  <p>
    When ownership is diffuse — multiple teams contributing to the same codebase, no
    clear responsible party, shared on-call rotations — quality degrades. Nobody owns
    the technical debt. Nobody prioritizes the flaky test. Nobody fixes the slow build.
    Everyone assumes someone else will do it.
  </p>

  <p>
    Team Topologies formalizes this: stream-aligned teams own their services end-to-end.
    The platform team provides infrastructure as a service. The boundaries are clear. The
    ownership is explicit. This is not just organizational hygiene — it directly predicts
    software quality.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Generative culture</h2>

  <p>
    The DORA research identifies organizational culture as the strongest predictor of
    software delivery performance. Specifically, generative culture — characterized by
    high trust, information flow, shared responsibility, and learning from failure
    instead of blaming.
  </p>

  <p>
    In a generative culture, a failed deployment is a learning opportunity. The team does
    a blameless post-mortem, identifies the systemic cause, and fixes the process. In a
    pathological culture, the same failure triggers blame, punishment, and new approval
    gates that slow everyone down.
  </p>

  <p>
    Tools cannot create culture. But tools can reinforce it. A tool that defaults to
    trust — advisory reports instead of blocking gates, team metrics instead of
    individual surveillance, autonomy over process — reinforces generative culture. A tool
    that defaults to control — mandatory approvals, individual activity tracking,
    management dashboards — reinforces pathological culture.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What does not create quality</h2>

  <p>
    The research is equally clear about what does not work:
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-err-400 shrink-0">&#10005;</span>
      <span><strong class="text-surface-300">More process</strong> — additional approval steps increase lead time without reducing change failure rate.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-err-400 shrink-0">&#10005;</span>
      <span><strong class="text-surface-300">Change advisory boards</strong> — external review of changes slows delivery without improving stability. Teams that own their services make better decisions than committees.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-err-400 shrink-0">&#10005;</span>
      <span><strong class="text-surface-300">Individual productivity metrics</strong> — measuring lines of code, commits per week, or PRs merged incentivizes volume over value.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-err-400 shrink-0">&#10005;</span>
      <span><strong class="text-surface-300">Infrequent large releases</strong> — batching changes into quarterly releases maximizes risk per deployment and minimizes learning opportunities.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-err-400 shrink-0">&#10005;</span>
      <span><strong class="text-surface-300">Separate QA teams</strong> — when testing is someone else's job, developers write less testable code and learn less from failures.</span>
    </li>
  </ul>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">How gittan maps to this</h2>

  <p>
    Every feature in gittan exists because the research says it contributes to quality:
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span>Gated push enforces continuous integration and small batches.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span>Terminal feedback makes the feedback loop as fast as possible.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span>Team ownership is the only ownership model. No individual namespaces.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span>DORA metrics show team health, not individual output.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span>Advisory reports over blocking gates. Trust the team.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-ok-400 shrink-0">&#10003;</span>
      <span>No process ceremony. Push, test, ship.</span>
    </li>
  </ul>

  <p>
    This is not a feature checklist we designed. It is the research applied to a product.
    The features are consequences of the evidence, not the other way around.
  </p>
</Article>
