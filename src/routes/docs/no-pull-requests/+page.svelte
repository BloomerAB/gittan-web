<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="It is gated. It is stricter than a PR."
  subtitle="We did not remove the gate. We removed the human-as-bottleneck from the gate."
>
  <p>
    The first reaction to "gittan has no pull requests" is almost always: so anyone
    can push anything to main? No. The opposite. Every push to main is gated by an
    automated policy pipeline. If your code violates a security rule, breaks a test,
    uses a banned dependency, or fails any check the organization has defined — the
    push is rejected. The code does not land. Full stop.
  </p>

  <p>
    This is not less strict than a PR. It is more strict. A PR gate depends on a human
    reviewer who may be stressed, rushed, or doing you a favour on a Friday afternoon.
    Under pressure, PRs get rubber-stamped — "LGTM, ship it." Everyone who has worked
    in a team knows this happens. A policy gate cannot be rubber-stamped. It runs the
    same checks every time, regardless of who is pushing, what day it is, or how urgently
    someone needs the change to land.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What the research actually says</h2>

  <p>
    The Accelerate research does not say "pull requests are bad." What it says is that
    heavyweight change-approval processes — external approvers, change-advisory boards,
    formal sign-off queues — correlate negatively with software delivery performance
    without improving stability. Meanwhile, trunk-based development, automated testing,
    and continuous integration correlate positively with both throughput and stability.
  </p>

  <p>
    A mandatory PR review with a human approver is a lightweight change-approval process
    by the research's definition. It is not a change-advisory board, but it shares the
    structural property: a human bottleneck between "code is ready" and "code is deployed."
    The bottleneck adds latency without reliably adding quality, because review effectiveness
    depends on the reviewer's available time, context, and willingness to push back — none
    of which the process guarantees.
  </p>

  <p>
    gittan's model — an automated policy gate on push, plus asynchronous architecture
    review that compiles findings after the code has landed — sits squarely inside what
    the research recommends. We are not stretching the findings. We are implementing them.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Ownership, not committees</h2>

  <p>
    The flip side of removing the human gate is that responsibility sits with the
    developer. You do not push code that is "probably fine, the reviewer will catch it."
    You push code that is ready — tested, clean, passing every policy. There is no
    colleague downstream whose job it is to fix your work for you.
  </p>

  <p>
    This is a higher standard, not a lower one. The PR model lets you externalize
    quality: throw it over the wall, wait for feedback, iterate. The gated-push model
    internalizes quality: you own the code all the way to "it passed and it shipped."
    If it breaks production, the team owns that — not a reviewer who approved it.
  </p>

  <p>
    This is also what makes AI-assisted development first-class. When the gate is policy
    and tests rather than a human queue, an individual — or an individual working with an
    AI — can take a change from idea to passing-and-shipped without waiting on social
    process. The model assumes capable people owning their output, not a committee.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The review theater problem</h2>

  <p>
    Here is what actually happens in most PR reviews: a developer opens a PR with 400
    lines across 12 files. The reviewer scrolls through, leaves a comment about a
    variable name, approves, and moves on. The structural problems — the missing error
    handling, the race condition, the incorrect assumption about nullability — go
    unnoticed because reviewing code out of context, line by line in a web diff, is
    genuinely hard.
  </p>

  <p>
    A PR with 50 lines might get a real review. A PR with 500 lines gets skimmed.
    Research backs this up — review effectiveness drops sharply as the size of the
    change increases. But the PR workflow incentivizes batching changes, which means the
    reviews that matter most are the ones least likely to be thorough.
  </p>

  <p>
    Many organizations have internalized "PRs = quality" as a belief. The result is a
    process that feels rigorous but does not catch the things that actually break
    production. It is theater — the appearance of quality control without the substance.
    The real quality comes from tests, from automated policy enforcement, from pair
    programming, from teams that understand their own code. Not from a checkbox that
    says "1 approval."
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">AI changed what review means</h2>

  <p>
    Line-by-line review made more sense when humans wrote every line. Catching a typo, a
    missing null check, an off-by-one error — that was valuable work. AI code generation
    has made that kind of review largely obsolete. The lines are usually correct.
  </p>

  <p>
    What matters now is structure: does this change belong in this service? Is this the
    right abstraction? Does this approach create a maintenance burden in six months? These
    questions cannot be answered in a line-by-line diff. They require understanding the
    system, the team's direction, and the architectural context — a conversation that
    happens better in person, in a pair session, or in a design discussion before the code
    is written.
  </p>

  <p>
    gittan's pipeline policies already enforce security scanning and test requirements. The
    next step is automated structural analysis — architecture pattern conformance, tooling
    consistency, dependency hygiene. These feed into the team's advisory report, continuously,
    on every push. Not once per PR when a reviewer has time.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Review still matters</h2>

  <p>
    We are not arguing against code review. We are arguing against the PR as the only
    mechanism for it, and against the belief that a PR approval is evidence of quality.
  </p>

  <p>
    Pair programming is code review in real time. Post-commit review on main catches
    things without blocking the author. Async review of small, frequent commits works
    when the team practices trunk-based development. gittan's architecture advisory
    compiles structural findings into a report the team can act on in their own cadence —
    not as a gate, but as a continuous signal.
  </p>

  <p>
    The PR model assumes the only valid review happens before merge, in a web UI, on a
    feature branch. That is one way to do it. It is not the only way, and for teams that
    want fast, small-batch delivery, it is the wrong way.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What it costs</h2>

  <p>
    Honesty about trade-offs: this model depends on developers who own their output. If
    a team is used to relying on PR review as a backstop for incomplete work, the
    transition is cultural, not just tooling. The gated push catches rule violations —
    it does not catch bad design decisions that break no rule.
  </p>

  <p>
    The answer is batch size. In trunk-based development with small, frequent commits,
    a bad design decision is a small change that is cheap to revert. The architecture
    advisory catches patterns over time and surfaces them as recommendations. The
    combination — small batches, automated policy, advisory architecture review — is not
    the same safety net as a PR review. It is a different safety net, grounded in
    reversibility rather than pre-approval. The trade-off is deliberate, and
    <a href="/docs/small-batches" class="text-accent-400 hover:text-accent-300 underline">we wrote a separate page</a>
    explaining why we believe it is the right one.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Compliance</h2>

  <p>
    Some regulated environments require documented review as policy. gittan's org
    policies can enforce a review step in the pipeline — a sign-off that is recorded
    and auditable. The mechanism is a pipeline step, not a PR. The policy is enforced
    by code, not by human process that can be skipped under pressure.
  </p>
</Article>
