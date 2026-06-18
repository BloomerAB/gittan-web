<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why we removed pull requests"
  subtitle="PRs conflate code review with code gating. We separated them."
>
  <p>
    Pull requests solve two problems at once: they gate code from reaching main, and they
    provide a place for code review. The issue is that these are different concerns with
    different requirements, and merging them creates overhead that slows teams down.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The gating problem</h2>

  <p>
    You want to prevent broken code from reaching main. That is a legitimate engineering
    concern. The PR model solves it by requiring manual approval before merge. But manual
    approval is a bottleneck. The reviewer might be in a meeting, on vacation, or working
    on something else. Your change sits in a queue.
  </p>

  <p>
    Meanwhile, the branch diverges from main. Other changes land. By the time you get
    approval, you might need to rebase. The longer the branch lives, the harder the merge.
    This is not a theoretical concern — it is the daily reality of every team using
    long-lived branches.
  </p>

  <p>
    gittan replaces the manual gate with an automated one. When you push to main, a
    pre-receive hook triggers your pipeline. If the pipeline passes, the push is accepted.
    If it fails, the push is rejected and the error output streams to your terminal. The
    gate is still there — it is just faster, more consistent, and never on vacation.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The review theater</h2>

  <p>
    Here is what actually happens in most PR reviews: a developer opens a PR with 400
    lines of changes across 12 files. The reviewer scrolls through, leaves a comment
    about a variable name, approves, and moves on. The structural problems — the missing
    error handling, the race condition, the incorrect assumption about how the database
    handles nulls — go unnoticed because reviewing code out of context, line by line in a
    web diff, is genuinely hard. It requires deep understanding of the system, and most
    reviewers do not have time to build that understanding for every PR in their queue.
  </p>

  <p>
    This is not a failure of discipline. It is a failure of the format. A PR with 50 lines
    might get a real review. A PR with 500 lines gets skimmed. Research backs this up —
    review effectiveness drops sharply as the size of the change increases. But the PR
    workflow incentivizes batching changes, which means the reviews that matter most are
    the ones least likely to be thorough.
  </p>

  <p>
    Many organizations have internalized "PRs = quality" as a belief. Managers who learned
    that PRs are best practice enforce mandatory reviews on every change. The result is a
    process that feels rigorous but does not actually catch bugs. It is theater — the
    appearance of quality control without the substance. The real quality comes from tests,
    from CI, from pair programming, from teams that understand their own code. Not from a
    checkbox that says "1 approval."
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">AI changed what review means</h2>

  <p>
    The PR review format made more sense when humans wrote every line. Catching a typo,
    a missing null check, an off-by-one error — that was valuable work that required
    reading individual lines carefully. AI code generation has made that kind of review
    largely obsolete. The lines are usually correct. The syntax is fine. The edge cases
    are handled.
  </p>

  <p>
    What AI does not do well is architecture. Does this change belong in this service?
    Is this the right abstraction? Does this approach create a maintenance burden in six
    months? Does the data flow make sense across the system? These are the questions that
    matter now, and they are exactly the questions that a line-by-line diff in a PR UI is
    worst at answering.
  </p>

  <p>
    The review that matters in 2026 is structural: does this fit, does this make sense,
    does this move us in the right direction. That conversation happens better in person,
    in a pair programming session, or in a design discussion before the code is written —
    not in a comment thread on line 47 of a 600-line diff.
  </p>

  <p>
    This is where gittan is heading. Our pipeline policies already enforce security
    scanning and test requirements. The next step is structural analysis — does this
    change follow the architecture patterns the team has established? Is the team using
    the right tools and libraries for the job? Are there inconsistencies that suggest a
    design conversation is needed? These are the things a platform can automate as
    pipeline steps, continuously, on every push — not once per PR when a reviewer has
    time.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Review still matters</h2>

  <p>
    We are not arguing against code review. We are arguing against the PR as the only
    mechanism for it.
  </p>

  <p>
    Pair programming is code review in real time. Mob programming is code review with the
    whole team. Post-commit review on main catches things that pre-merge review would have
    caught, but without blocking the author. Async review of commits works fine when changes
    are small and frequent — which they are when you practice trunk-based development.
  </p>

  <p>
    The PR model assumes that the only valid review happens before merge, in a web UI, on
    a feature branch. That is one way to do it. It is not the only way, and for many teams
    it is not the best way.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Smaller changes, less risk</h2>

  <p>
    When the cost of shipping is low — push and wait a few seconds — developers make smaller
    changes. Smaller changes are easier to review, easier to understand, and easier to revert.
    The risk per change goes down.
  </p>

  <p>
    When the cost of shipping is high — create branch, open PR, wait for CI, wait for review,
    address comments, wait again, merge — developers batch changes. Bigger changes are harder
    to review and harder to revert. The risk per change goes up.
  </p>

  <p>
    We chose the model that incentivizes small, frequent changes over the model that
    incentivizes large, infrequent ones.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What about compliance?</h2>

  <p>
    Some regulated environments require pre-merge review as policy. If that is your
    situation, gittan's org policies can enforce a review step in the pipeline — a sign-off
    that is recorded and auditable. But the mechanism is a pipeline step, not a PR. The
    policy is enforced by code, not by human process.
  </p>
</Article>
