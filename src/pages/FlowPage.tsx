export function FlowPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-white mb-2">How Gittan works</h1>
      <p className="text-surface-500 mb-12">From push to production. No ceremony.</p>

      {/* Main flow diagram */}
      <div className="mb-16">
        <h2 className="text-lg font-medium text-white mb-6">The pipeline</h2>
        <div className="bg-surface-900 border border-surface-800 rounded-lg p-8">
          <div className="flex items-center justify-between gap-2">
            <FlowNode label="git push" icon="→" accent />
            <FlowArrow />
            <FlowNode label="gated?" icon="?" />
            <FlowArrow />
            <FlowNode label="pipeline runs" icon="⟳" />
            <FlowArrow />
            <FlowNode label="green?" icon="?" />
            <FlowArrow />
            <FlowNode label="main updated" icon="✓" accent />
          </div>
          <div className="flex items-center justify-between gap-2 mt-2 px-4">
            <span className="text-[10px] text-surface-600 w-20 text-center">your terminal</span>
            <span className="w-8" />
            <span className="text-[10px] text-surface-600 w-20 text-center">pre-receive hook</span>
            <span className="w-8" />
            <span className="text-[10px] text-surface-600 w-24 text-center">feedback streams in terminal</span>
            <span className="w-8" />
            <span className="text-[10px] text-surface-600 w-20 text-center">pass or reject</span>
            <span className="w-8" />
            <span className="text-[10px] text-surface-600 w-20 text-center">deploy triggers</span>
          </div>

          {/* Failure path */}
          <div className="mt-6 pt-4 border-t border-surface-800">
            <div className="flex items-center gap-3 ml-[60%]">
              <span className="text-err-400 text-sm">✗ red?</span>
              <span className="text-surface-700">→</span>
              <span className="text-sm text-surface-400">push rejected, main unchanged, you fix and push again</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison: GitHub vs Gittan */}
      <div className="mb-16">
        <h2 className="text-lg font-medium text-white mb-6">GitHub vs Gittan</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-900 border border-surface-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-surface-400 mb-4">GitHub</h3>
            <div className="space-y-2">
              <Step n="1" text="Create branch" muted />
              <Step n="2" text="Push branch" muted />
              <Step n="3" text="Open pull request" muted />
              <Step n="4" text="Wait for CI" muted />
              <Step n="5" text="Request review" muted />
              <Step n="6" text="Wait for reviewer" muted />
              <Step n="7" text="Address comments" muted />
              <Step n="8" text="Re-request review" muted />
              <Step n="9" text="Approve" muted />
              <Step n="10" text="Merge" muted />
              <Step n="11" text="Delete branch" muted />
            </div>
            <p className="text-xs text-surface-600 mt-4">11 steps. Multiple context switches. Hours to days.</p>
          </div>

          <div className="bg-surface-900 border border-accent-400/20 rounded-lg p-6">
            <h3 className="text-sm font-medium text-accent-400 mb-4">Gittan</h3>
            <div className="space-y-2">
              <Step n="1" text="git push origin main" highlight />
            </div>
            <p className="text-xs text-surface-400 mt-4">1 step. Result in your terminal. Seconds.</p>
          </div>
        </div>
      </div>

      {/* Pipeline layers */}
      <div className="mb-16">
        <h2 className="text-lg font-medium text-white mb-6">Pipeline config layers</h2>
        <p className="text-surface-500 text-sm mb-4">Three layers compose at runtime. Platform teams control policies, developers control their steps.</p>
        <div className="bg-surface-900 border border-surface-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-800 bg-policy-400/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-policy-400 bg-policy-400/10 px-1.5 py-0.5 rounded">org policy</span>
              <span className="text-sm text-white">Platform team controls</span>
            </div>
            <p className="text-xs text-surface-500">Injected automatically. Teams cannot remove. Security scanning, license checks, compliance.</p>
            <code className="text-xs text-surface-600 font-mono mt-2 block">✦ npm-audit, trivy, license-check</code>
          </div>
          <div className="px-6 py-4 border-b border-surface-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-surface-400 bg-surface-800 px-1.5 py-0.5 rounded">team template</span>
              <span className="text-sm text-white">Team defaults</span>
            </div>
            <p className="text-xs text-surface-500">Fallback when no repo config. Standard pipeline for "this is a Node.js API."</p>
            <code className="text-xs text-surface-600 font-mono mt-2 block">lint, test, build</code>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-surface-300 bg-surface-800 px-1.5 py-0.5 rounded">.gittan.yaml</span>
              <span className="text-sm text-white">Developer controls</span>
            </div>
            <p className="text-xs text-surface-500">Repo-specific steps. Overrides template. Additive with policies.</p>
            <code className="text-xs text-surface-600 font-mono mt-2 block">integration-test, e2e, deploy</code>
          </div>
        </div>
      </div>

      {/* Cascade diagram */}
      <div className="mb-16">
        <h2 className="text-lg font-medium text-white mb-6">Cross-repo cascade</h2>
        <p className="text-surface-500 text-sm mb-4">Change a shared library. All consumers tested automatically. No monorepo needed.</p>
        <div className="bg-surface-900 border border-surface-800 rounded-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-surface-800 border border-accent-400/30 rounded px-4 py-2 text-sm text-white">
              shared-types <span className="text-ok-400 ml-2">✓ pipeline passed</span>
            </div>
            <div className="flex items-center gap-2 text-surface-600">
              <span>↙</span>
              <span>↓</span>
              <span>↘</span>
            </div>
            <div className="flex gap-4">
              <CascadeTarget name="api-service" status="passed" />
              <CascadeTarget name="runner" status="passed" />
              <CascadeTarget name="web" status="running" />
            </div>
            <p className="text-xs text-surface-600 mt-2">All consumers triggered. Contract tests verify compatibility.</p>
          </div>
        </div>
      </div>

      {/* Terminal experience */}
      <div className="mb-16">
        <h2 className="text-lg font-medium text-white mb-6">Terminal-first feedback</h2>
        <p className="text-surface-500 text-sm mb-4">No browser needed. Pipeline results stream directly during git push.</p>
        <div className="bg-surface-950 border border-surface-800 rounded-lg p-6 font-mono text-sm">
          <div className="text-surface-600 mb-2">$ git push origin main</div>
          <div className="text-surface-500">remote:</div>
          <div className="text-surface-400">remote: ── pipeline #847 ──────────────────</div>
          <div className="text-surface-500">remote: <span className="text-policy-400">✦ audit</span>         <span className="text-ok-400">passed</span>        3s</div>
          <div className="text-surface-500">remote:   <span className="text-surface-300">lint</span>          <span className="text-ok-400">passed</span>        2s</div>
          <div className="text-surface-500">remote:   <span className="text-surface-300">test</span>          <span className="text-ok-400">passed</span>       12s</div>
          <div className="text-surface-500">remote:   <span className="text-surface-300">build</span>         <span className="text-ok-400">passed</span>        8s</div>
          <div className="text-surface-500">remote: <span className="text-policy-400">✦ trivy</span>        <span className="text-ok-400">passed</span>        5s</div>
          <div className="text-surface-400">remote: ── pipeline passed ────────────────</div>
          <div className="text-surface-400">remote: <span className="text-ok-400">✓</span> main → a1b2c3d</div>
          <div className="text-surface-400">remote: <span className="text-ok-400">✓</span> deploy triggered</div>
          <div className="text-surface-500">remote:</div>
          <div className="text-surface-300 mt-2">To gittan.eu:bloomer/api-service.git</div>
          <div className="text-surface-300">   a1b2c3d..d4e5f6g  main → main</div>
          <div className="mt-4 text-surface-600">$</div>
        </div>
        <p className="text-xs text-surface-600 mt-3">✦ = org policy step (injected by platform team). No prefix = repo step.</p>
      </div>
    </div>
  )
}

function FlowNode({ label, icon, accent }: { label: string; icon: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${accent ? "text-accent-400" : "text-surface-400"}`}>
      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg ${
        accent ? "border-accent-400 bg-accent-400/10" : "border-surface-700 bg-surface-800"
      }`}>
        {icon}
      </div>
      <span className="text-[11px] text-center leading-tight">{label}</span>
    </div>
  )
}

function FlowArrow() {
  return <div className="text-surface-700 text-lg flex-shrink-0">→</div>
}

function Step({ n, text, muted, highlight }: { n: string; text: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${
      highlight ? "text-accent-400" : muted ? "text-surface-600" : "text-surface-400"
    }`}>
      <span className={`text-xs w-5 text-right ${highlight ? "text-accent-400" : "text-surface-700"}`}>{n}.</span>
      <span>{text}</span>
    </div>
  )
}

function CascadeTarget({ name, status }: { name: string; status: "passed" | "running" | "failed" }) {
  const color = status === "passed" ? "text-ok-400" : status === "running" ? "text-yellow-400 animate-pulse" : "text-err-400"
  const icon = status === "passed" ? "✓" : status === "running" ? "⟳" : "✗"
  return (
    <div className="bg-surface-800 rounded px-3 py-2 text-sm text-surface-300">
      {name} <span className={`ml-1 ${color}`}>{icon}</span>
    </div>
  )
}
