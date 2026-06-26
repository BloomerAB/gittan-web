<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why your team has no flow"
  subtitle="Slow pipelines and PR queues are not friction. They are the reason your DORA metrics are red."
>
  <p>
    Flow is the state where a developer holds the full context of a problem in their
    head, writes code, ships it, and moves on to the next thing. It is where good
    software comes from. It is also extraordinarily fragile. A 12-minute pipeline, a
    PR waiting for review, a merge conflict from a stale branch — any of these breaks
    flow, and getting it back takes far longer than the interruption itself.
  </p>

  <p>
    Research consistently shows that context switches cost 15 to 25 minutes of recovery
    time. A developer who pushes code, waits 10 minutes for CI, gets a review comment,
    switches to another task, comes back 2 hours later, rebases, waits for CI again —
    that developer has lost half a day to a change that took 30 minutes to write.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The pipeline tax</h2>

  <p>
    Most CI pipelines are slow because they were not designed to be fast. GitHub Actions
    provisions a fresh VM for every run. That means pulling images, installing
    dependencies, setting up toolchains — before a single line of your code runs. A
    pipeline that does 2 minutes of actual work takes 10 minutes because 8 minutes is
    infrastructure overhead.
  </p>

  <p>
    Developers adapt to slow pipelines by batching changes. Why push a small fix if the
    pipeline takes 12 minutes? Better to accumulate a few changes and push them together.
    This is rational behavior, but it destroys two DORA metrics at once: deployment
    frequency goes down because you push less often, and lead time goes up because
    changes sit on your machine longer before reaching main.
  </p>

  <p>
    Worse, bigger changes are harder to review, harder to revert, and more likely to
    break something. The slow pipeline does not just slow you down — it incentivizes
    the exact behavior that makes software delivery worse.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The PR queue</h2>

  <p>
    A pull request is a synchronization point. Your code is ready, but it cannot land
    until someone else looks at it. That someone is working on their own thing. They
    will get to your PR when they have time — maybe in an hour, maybe tomorrow, maybe
    after the sprint planning meeting that just got scheduled.
  </p>

  <p>
    While you wait, you have two options: sit idle or start something else. If you start
    something else, you context-switch. When the review comes back with comments, you
    context-switch again. If the comments require changes, you make them, push, wait for
    CI, wait for re-review. Two context switches, two pipeline runs, and half a day gone
    for something that might have been a three-line suggestion.
  </p>

  <p>
    Multiply this across a team of 8 developers, each with 2-3 open PRs, each waiting on
    each other. The queue is not a line — it is a web of dependencies where everyone is
    blocked on everyone else. This is why teams with mandatory PR review have lower
    deployment frequency. The process that was supposed to ensure quality is the process
    that prevents shipping.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What flow actually requires</h2>

  <p>
    Flow requires a tight feedback loop: write, push, know within seconds whether it
    worked, move on. Every minute of latency in that loop is a minute where the developer
    might lose context, get interrupted, or start something else.
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Fast pipelines</strong> — gittan's runners are warm and images are pre-pulled. The pipeline starts in under a second. A typical run takes 1-3 minutes, not 10-15.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">No PR queue</strong> — push to main directly. The gated push is the quality gate. There is no reviewer to wait for, no branch to keep alive, no merge button to click.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Terminal feedback</strong> — pipeline output streams to your terminal during push. You do not switch to a browser, open a CI dashboard, and refresh. You stay in your editor.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Small changes</strong> — when pushing is cheap and fast, developers push more often. Smaller changes, more frequently. This is what DORA measures and what high-performing teams do.</span>
    </li>
  </ul>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">DORA is measuring this</h2>

  <p>
    Deployment frequency and lead time for changes — two of the four DORA metrics — are
    direct measurements of flow. A team that deploys multiple times per day with a lead
    time of under an hour has flow. A team that deploys weekly with a lead time of days
    does not.
  </p>

  <p>
    The Accelerate research is unambiguous: high-performing teams have both high
    deployment frequency and low lead time. These teams also have lower change failure
    rates and faster recovery times. Flow is not just a developer experience concern —
    it is a delivery performance predictor.
  </p>

  <p>
    When your pipeline takes 12 minutes and every change requires a PR with manual review,
    you are structurally preventing your team from reaching high performance. It is not a
    discipline problem. It is not a skills problem. It is an infrastructure and process
    problem. The tools you chose are the bottleneck.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The compound effect</h2>

  <p>
    A developer who pushes 8 times a day with a 90-second feedback loop ships more, ships
    smaller, and ships safer than a developer who pushes once a day with a 15-minute
    pipeline and a PR queue. Over a week, the difference is significant. Over a quarter,
    it is transformative. Over a year, it is the difference between a team that delivers
    and a team that is perpetually "almost done."
  </p>

  <p>
    Flow is not a luxury. It is the foundation of delivery performance. Everything that
    interrupts it — slow CI, PR queues, branch management, context switches — is cost.
    We built gittan to eliminate as much of that cost as possible.
  </p>
</Article>
