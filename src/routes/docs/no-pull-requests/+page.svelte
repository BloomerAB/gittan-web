<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="It is gated. It is stricter than a PR."
  subtitle="We did not remove the gate. We removed the human-as-bottleneck from the gate."
>
  <p>
    The first reaction to "gittan has no pull requests" is almost always: so anyone
    can push anything to main? No. The opposite. Every push to main runs through an
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
    We need to be precise here, because this is where credibility lives.
  </p>

  <p>
    The Accelerate research does not say peer review is harmful. The opposite: DORA
    endorses peer-review-based approval and contrasts it favourably against external
    approval. The negative finding is specifically about approval by people
    <strong class="text-surface-300">external to the team</strong> — change-advisory
    boards, senior managers, formal sign-off queues — which correlates with low
    performance and shows no evidence of lowering change-fail rates.
  </p>

  <p>
    A pull request is a form of peer review. DORA endorses peer review. So the research
    does not support "PRs are bad." What it supports is: remove the
    <strong class="text-surface-300">blocking gate</strong> (external approval, heavyweight
    process), keep the <strong class="text-surface-300">review</strong> in another form.
    That is exactly what gittan does.
  </p>

  <p>
    We killed the gate. We kept the review — as pair programming, post-commit review,
    and an asynchronous architecture advisory that compiles findings into a team report.
    The review happens. It just does not sit between "code is ready" and "code is shipped."
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The structural problem with diffs</h2>

  <p>
    Set the research aside. There is a structural argument that needs no study.
  </p>

  <p>
    A PR operates at the wrong granularity. A diff shows you lines in a file. It does
    not show you whether the change belongs in this service, whether the abstraction is
    right, whether it creates a maintenance burden in six months. Those things live in
    the relationship between the change and the whole system — not in the diff. The
    format is limited to the line level, and the things that break production live above
    it.
  </p>

  <p>
    A PR with 50 lines might get a real review. A PR with 500 lines gets skimmed.
    Review effectiveness drops as the size increases. But the PR workflow incentivizes
    batching — creating a branch, opening a PR, waiting for CI, waiting for review is
    expensive, so developers accumulate changes to amortize the overhead. The reviews
    that matter most are the ones least likely to be thorough.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">The bet: AI is shifting the economics</h2>

  <p>
    This part is our own position, not a research finding — we are explicit about the
    difference.
  </p>

  <p>
    As more line-level code is AI-generated, the marginal value of line-by-line human
    review falls. The lines are usually correct. The syntax is fine. What matters is
    structure: does this change belong here? Is this the right abstraction? Does the
    data flow make sense across the system?
  </p>

  <p>
    We built for where review is heading, given how AI changes the economics today.
    Human judgment is worth most on structure and direction — not on reading diffs. The
    shift is already visible, and it favours a model where line-level checks are
    automated and humans review at a higher altitude.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Ownership, not committees</h2>

  <p>
    A human backstop downstream lets the developer externalize quality — "ship it, the
    reviewer will catch it." Remove the backstop and the bar at write-time rises,
    because there is no one left to hand incomplete work to. You do not push code that
    is "probably fine." You push code that is ready — tested, clean, passing every
    policy. This is an incentive argument: how people behave around safety nets.
  </p>

  <p>
    The objection: if automated gates and AI review sit downstream, have you not just
    swapped a human backstop for a machine one? The distinction matters. A human
    approver <strong class="text-surface-300">vouches</strong> — "LGTM" is co-ownership,
    the reviewer goes on record, responsibility is shared. A gate
    <strong class="text-surface-300">measures</strong> — it reports pass or fail and
    vouches for nothing. It hands the result back to you, and the fix is still yours.
    A gate does not recreate the responsibility-shift that a PR does, because it never
    says "I approve this." It says "this passed these checks. You own the rest."
  </p>

  <p>
    This is also what makes AI-assisted development first-class. When the gate is policy
    and tests rather than a human queue, an individual — or an individual working with an
    AI — can take a change from idea to passing-and-shipped without waiting on social
    process. The model assumes capable people owning their output, not a committee.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Humans promoted, not replaced</h2>

  <p>
    We did not replace humans with automation. We moved each kind of review to whoever
    does it best.
  </p>

  <p>
    Line-level review — is this line correct, is there a null check, is the syntax right
    — is mechanical work. It scales terribly when a human does it, and it was never the
    human's strength. That goes to the automated gate: policy checks, tests, AI analysis.
  </p>

  <p>
    Architecture, structure, right-tooling — does this fit the system, is the team heading
    in the right direction, is this the right trade-off — that is
    <strong class="text-surface-300">lifted to team level</strong> as human review at a
    higher altitude, where judgment and ownership live. The architecture advisory compiles
    findings into a team report. The team discusses it in their own cadence. The human is
    not deleted. The human is promoted — off rubber-stamping diffs (a job nobody wants)
    onto the level where a senior engineer adds something irreplaceable.
  </p>

  <p>
    This is also a recruiting argument. gittan offers engineers the chance to stop being
    a review machine and own the system instead.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">What it costs</h2>

  <p>
    Honesty about the trade-off: this model depends on developers who own their output.
    If a team uses PR review as a backstop for incomplete work, the transition is cultural,
    not just tooling. The gated push catches rule violations — it does not catch the
    subtle design decision that breaks no rule.
  </p>

  <p>
    The answer is batch size. In trunk-based development with small, frequent commits,
    a bad design decision is a small change that is cheap to revert. The architecture
    advisory catches patterns over time and surfaces them as recommendations. The
    combination — small batches, automated policy, advisory review — is a different
    safety net from a PR, grounded in reversibility rather than pre-approval.
    <a href="/docs/small-batches" class="text-accent-400 hover:text-accent-300 underline">We wrote a separate page</a>
    explaining why we believe it is the right trade-off.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Compliance</h2>

  <p>
    Some regulated environments require documented review as policy. DORA notes that
    peer-review approval can satisfy segregation-of-duties requirements when captured
    in the platform. gittan's pipeline sign-off is exactly this mechanism — a review
    step that is recorded, auditable, and enforced by code. It is not a workaround for
    the DORA-endorsed model. It is the model.
  </p>
</Article>
