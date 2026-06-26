<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Small batches and the case for advisory review"
  subtitle="When every change is small enough to revert in minutes, pre-approval stops being the only safety net."
>
  <p>
    There is one category of problem that an automated policy gate does not catch: the
    subtle design decision that breaks no rule but is still wrong. The function is tested,
    the security scan passes, the code is clean — but the abstraction is in the wrong
    place, or the data model will not scale, or the service boundary should have been
    drawn differently.
  </p>

  <p>
    In a PR-based workflow, this is where a careful reviewer earns their keep. They see the
    design problem, leave a comment, the author fixes it before merge. This is the genuine
    value of pre-merge review, and we are not dismissing it.
  </p>

  <p>
    But this value depends on two assumptions that rarely hold: that the reviewer has time
    and context to identify the design problem, and that the change is large enough that
    fixing it after merge would be expensive. When either assumption fails — and in
    practice, both fail routinely — the pre-merge review adds latency without adding
    safety.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The reversibility argument</h2>

  <p>
    The cost of a wrong decision is proportional to how hard it is to reverse. An 800-line
    PR that restructures a service's data layer is expensive to revert — the branch has
    been alive for a week, other changes have built on top of it, reverting means untangling
    dependencies. Pre-merge review is the right investment here, because the cost of
    reversal justifies the cost of blocking.
  </p>

  <p>
    A 40-line commit that introduces a function in the wrong module is cheap to revert.
    Move the function, push again, done in 10 minutes. The cost of catching it after the
    fact is almost nothing. Pre-merge review for this change is overhead — the blocking
    cost exceeds the reversal cost.
  </p>

  <p>
    The key insight: if you keep batches small, the category of "wrong decisions that are
    expensive to reverse" shrinks dramatically. Most design decisions become cheap to fix
    after the code has landed. The case for blocking pre-merge review weakens as batch
    size decreases, because the thing it protects against — expensive reversal — stops
    being expensive.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Why gittan's model maintains small batches</h2>

  <p>
    Batch size is not a discipline problem. It is an incentive problem. When pushing is
    expensive — create branch, open PR, wait for CI, wait for review, address comments,
    rebase, wait again — developers batch changes to amortize the overhead. Bigger PRs,
    longer branches, more risk per change.
  </p>

  <p>
    When pushing is cheap — push to main, pipeline runs in 90 seconds, result streams to
    your terminal — developers push more often. Smaller commits, more frequently. This is
    not a cultural aspiration. It is a structural consequence of removing the overhead.
  </p>

  <p>
    gittan's gated push is designed to keep this cost low. No branch to manage. No PR to
    open. No reviewer to wait for. No merge button to click. The feedback loop is: write,
    push, wait 90 seconds, move on. When the loop is this tight, there is no incentive
    to batch.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Advisory architecture review</h2>

  <p>
    Small batches make reversal cheap, but they do not eliminate the need for design
    review. They change when it happens.
  </p>

  <p>
    gittan's architecture advisory is an asynchronous report that accumulates over time.
    It tracks patterns across pushes: is this team introducing inconsistent abstractions?
    Is a service growing in a direction that suggests it should be split? Are there
    structural patterns that suggest technical debt is accumulating? These findings go into
    the team's report — visible in the dashboard, discussed in the team's own cadence.
  </p>

  <p>
    This is not a gate. The code has already landed. The finding is a recommendation, not
    a blocker. The team decides whether to act on it, when to act on it, and how to
    prioritize it against their other work.
  </p>

  <p>
    The reason this works is small batches. Each individual change that contributed to the
    finding is small enough to reverse or refactor independently. The advisory does not
    need to block the push, because the cost of addressing the finding after the fact is
    low. If it were an 800-line change, you would want to catch it before merge. When it
    is eight 40-line changes, you catch the pattern and address it as a team.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What this depends on</h2>

  <p>
    This model has preconditions. We are explicit about them because the trade-off only
    holds when they are met:
  </p>

  <ul class="list-none space-y-2">
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Fast pipelines</strong> — if the pipeline takes 15 minutes, developers batch to avoid the wait. The incentive structure breaks.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Developers who own their output</strong> — this model does not work for teams that use PR review as a backstop for incomplete work. The cultural expectation is: you push when it is ready, not when you want feedback.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Good test coverage</strong> — the policy gate catches rule violations and test failures. If the tests are thin, the gate is thin. The automated safety net is only as good as the checks it runs.</span>
    </li>
    <li class="flex gap-2">
      <span class="text-accent-400 shrink-0">&#8227;</span>
      <span><strong class="text-surface-300">Team engagement with the advisory</strong> — the architecture report is useful only if the team reads it and acts on it. If findings are ignored, design problems accumulate. The platform surfaces the information; the team has to care.</span>
    </li>
  </ul>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The trade-off, stated plainly</h2>

  <p>
    The PR model trades throughput for pre-approval: every change is reviewed before it
    lands, at the cost of latency, context switches, and batch-size inflation. The
    trade-off is: slower delivery, but wrong design decisions are (sometimes) caught
    before merge.
  </p>

  <p>
    gittan's model trades pre-approval for reversibility: changes land immediately if
    they pass policy, and design review happens asynchronously. The trade-off is: a wrong
    design decision lands on main, but it is small enough to revert cheaply, and the
    advisory catches patterns over time.
  </p>

  <p>
    Neither model is free. The question is which cost your team is more willing to pay.
    The Accelerate research suggests that the throughput cost of heavyweight approval
    processes is not recovered in stability. We built for the model the data supports.
  </p>
</Article>
