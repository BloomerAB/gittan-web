export function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-white mb-2">FAQ</h1>
      <p className="text-surface-500 mb-12">Why Gittan works the way it does.</p>

      <div className="space-y-8">
        <Q
          question="Why no pull requests?"
          answer="Pull requests are ceremony. They conflate code review with merge gating, create context-switching, and slow down teams that trust each other. Gittan replaces PRs with gated push — your pipeline runs before the commit lands on main. If you need human review, add a review step in .gittan.yaml. It's opt-in, not mandatory."
        />

        <Q
          question="Why trunk-based development?"
          answer="Long-lived branches create merge conflicts, hide integration problems, and delay feedback. Trunk-based means you push to main frequently, pipelines catch problems immediately, and main is always deployable. This is how Google, Meta, and Spotify ship — it works."
        />

        <Q
          question="Why micro repos instead of monorepos?"
          answer="Monorepos exist because multi-repo tooling sucks. Gittan fixes the tooling instead. Cross-repo cascade pipelines, automatic dependency detection, and contract testing give you the atomicity guarantees of a monorepo without the build complexity, tooling overhead, and permission nightmares."
        />

        <Q
          question="Why no issues or wiki?"
          answer="Gittan does git, pipelines, and teams. That's it. Issues belong in Linear, Jira, or GitHub Issues. Documentation belongs in your docs site. Communication belongs in Slack or Discord. We don't build half-baked versions of tools that already exist."
        />

        <Q
          question="Why no stars or social features?"
          answer="Stars measure popularity, not quality. Gittan is for private teams shipping code, not open source community building. Your dependency graph and DORA metrics tell you more about a repo's health than a star count ever will."
        />

        <Q
          question="Will you add feature X?"
          answer="Probably not. Gittan is intentionally limited. Every feature we add is a feature we maintain forever with a team of max 5 people. If your feature request moves away from trunk-based development, poly repos, or pipeline-first workflows — the answer is no. We'd rather do three things exceptionally well than ten things poorly."
        />

        <Q
          question="Why no per-seat pricing?"
          answer="Per-seat pricing punishes collaboration. Add a contractor for a week? That's another seat. Onboard an intern? Another seat. Gittan charges for what actually costs us money: compute minutes and storage. Add as many users as you want."
        />

        <Q
          question="Why is OIDC/SSO included on every plan?"
          answer="Because it's a security feature, not a luxury. GitHub charges $21/user/month for SSO. That's extortion. Gittan includes OIDC on every plan because your identity provider shouldn't be a premium add-on."
        />

        <Q
          question="Why pipeline feedback in the terminal?"
          answer="Because that's where you already are. Every other git host forces you to open a browser, find the right workflow run, wait for it to load, and parse a nested UI to see if your push worked. Gittan shows you the result in the same git push command. Under 1 second to start, results stream live."
        />

        <Q
          question="Why no GitHub Actions marketplace?"
          answer="The Actions marketplace is a supply chain nightmare. You're pulling code from random repos and running it in your CI. Gittan pipeline steps are container images — transparent, auditable, no hidden JavaScript. Org admins control which images are allowed."
        />

        <Q
          question="Can I self-host Gittan?"
          answer="No. Gittan is SaaS. We run it, we maintain it, we keep it secure. Self-hosting means you maintain it — and that's a full-time job we don't want to push onto you. You can run self-hosted pipeline runners if you need custom infrastructure for execution."
        />

        <Q
          question="Why are you building this?"
          answer="Because we use git hosting every day and everything available is either too complex (GitLab), too expensive (GitHub Enterprise), or too limited (Gitea). We want a tool that does git, pipelines, and teams — fast, simple, and without the bullshit."
        />
      </div>
    </div>
  )
}

function Q({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-surface-800 pb-6">
      <h3 className="text-lg font-medium text-white mb-2">{question}</h3>
      <p className="text-surface-400 leading-relaxed">{answer}</p>
    </div>
  )
}
