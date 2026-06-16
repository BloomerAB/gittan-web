export function FlowPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-white mb-2">How Gittan works</h1>
      <p className="text-surface-500 mb-12">From push to production. No ceremony.</p>

      <div className="space-y-16">
        <FlowStep
          number="1"
          title="Push to main"
          description="You push code. That's it. No branch, no PR, no review request. Just git push origin main."
          terminal={[
            "$ git push origin main",
            "remote:",
            "remote: ── pipeline #847 ──────────────────",
            "remote: ✓ lint                 2s",
            "remote: ✓ test                12s",
            "remote: ✓ build                8s",
            "remote: ── pipeline passed ────────────────",
            "remote: ✓ main → a1b2c3d",
          ]}
        />

        <FlowStep
          number="2"
          title="Pipeline runs in your terminal"
          description="No tab-switching to a web UI. Pipeline feedback streams directly in your terminal during git push. You see green or red before your prompt returns."
        />

        <FlowStep
          number="3"
          title="Gated branches hold bad code"
          description="Main is always deployable. If the pipeline fails, the push is rejected. Your commit never reaches main. No revert, no broken builds."
          terminal={[
            "$ git push origin main",
            "remote:",
            "remote: ── pipeline #848 ──────────────────",
            "remote: ✓ lint                 2s",
            "remote: ✗ test                 4s",
            "remote:   src/auth.test.ts:42",
            "remote:   expected 401, got 500",
            "remote: ── pipeline failed ────────────────",
            "remote: ✗ main unchanged",
            "",
            " ! [remote rejected] main → main (pipeline failed)",
          ]}
        />

        <FlowStep
          number="4"
          title="Org policies inject steps automatically"
          description="Platform teams define security scanning, linting, or compliance checks that run on every push — without touching each repo's config. Teams can't skip them."
          detail="Policies match repos by file patterns (package.json → Node.js rules), team name, or repo name. Steps are injected before or after the repo's own pipeline."
        />

        <FlowStep
          number="5"
          title="Dependencies cascade"
          description="Change a shared library and all downstream repos are tested automatically. Gittan knows the dependency graph and triggers cascade pipelines."
          terminal={[
            "shared-types passes on main",
            "  → cascade: api-service pipeline triggered",
            "  → cascade: runner pipeline triggered",
            "  → cascade: web pipeline triggered",
            "  All 3 consumers passed ✓",
          ]}
        />

        <FlowStep
          number="6"
          title="Team dashboard shows what matters"
          description="You see your team's repos. Not everyone else's noise. DORA metrics (push frequency, lead time, rejection rate, recovery time) tell you if you're shipping well."
        />
      </div>
    </div>
  )
}

function FlowStep({
  number,
  title,
  description,
  detail,
  terminal,
}: {
  number: string
  title: string
  description: string
  detail?: string
  terminal?: string[]
}) {
  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="text-2xl font-semibold text-accent-400 shrink-0 w-8">{number}</span>
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-surface-400 leading-relaxed">{description}</p>
          {detail && (
            <p className="text-surface-500 text-sm mt-2">{detail}</p>
          )}
        </div>
      </div>
      {terminal && (
        <div className="mt-4 ml-12 bg-surface-900 border border-surface-800 rounded-md p-4 font-mono text-sm">
          {terminal.map((line, i) => (
            <div key={i} className={`${
              line.includes("✓") ? "text-ok-400" :
              line.includes("✗") ? "text-err-400" :
              line.includes("remote:") ? "text-surface-400" :
              line.startsWith("$") ? "text-white" :
              "text-surface-500"
            }`}>
              {line || " "}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
