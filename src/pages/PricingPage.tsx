export function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold text-white mb-2">Pricing</h1>
      <p className="text-surface-500 mb-12">
        Two plans. No per-seat pricing. SSO included on both.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-surface-900 border border-surface-800 rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Starter</h2>
            <p className="text-sm text-surface-500 mt-1">Small teams getting started</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">€29</span>
            <span className="text-surface-500 text-sm">/mo</span>
          </div>

          <div className="space-y-2 text-sm mb-8">
            <Included text="Up to 2 users" />
            <Included text="1 team, 10 repos" />
            <Included text="2 000 CI minutes" />
            <Included text="20 GB storage" />
            <Included text="SSO / OIDC included" />
          </div>

          <a
            href="/oauth/authorize?response_type=code&client_id=gittan-web&redirect_uri=https://gittan.eu/auth/callback&scope=openid+profile+email"
            className="block w-full text-center border border-surface-700 hover:border-surface-500 text-surface-300 py-3 rounded-md text-sm font-medium transition-colors"
          >
            Start 14-day free trial
          </a>
        </div>

        <div className="bg-surface-900 border border-accent-400/20 rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Team</h2>
            <p className="text-sm text-surface-500 mt-1">Growing teams that need full control</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">€199</span>
            <span className="text-surface-500 text-sm">/mo</span>
          </div>

          <div className="space-y-2 text-sm mb-8">
            <Included text="Unlimited users, teams, repos" />
            <Included text="10 000 CI minutes" />
            <Included text="100 GB storage" />
            <Included text="SSO / OIDC included" />
            <Included text="Org policies" />
            <Included text="Cascade pipelines" />
            <Included text="Dependency graph" />
            <Included text="Team templates" />
            <Included text="DORA metrics" />
            <Included text="Audit log" />
          </div>

          <a
            href="/oauth/authorize?response_type=code&client_id=gittan-web&redirect_uri=https://gittan.eu/auth/callback&scope=openid+profile+email"
            className="block w-full text-center bg-accent-600 hover:bg-accent-500 text-white py-3 rounded-md text-sm font-medium transition-colors"
          >
            Start 14-day free trial
          </a>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-medium text-white mb-4">Need more compute?</h2>
        <div className="bg-surface-900 border border-surface-800 rounded-lg p-6">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p className="text-white font-medium">CI block</p>
              <p className="text-xs text-surface-500">10 000 extra minutes per block</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-semibold text-white">€79</span>
              <span className="text-surface-500 text-sm">/block</span>
            </div>
          </div>
          <p className="text-xs text-surface-600">
            Add blocks as you need them. Each block adds 10 000 CI minutes to your monthly allowance.
            No surprise bills — you choose how many blocks you want.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-medium text-white mb-4">Extra storage</h2>
        <div className="bg-surface-900 border border-surface-800 rounded-lg p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-white font-medium">Beyond included storage</p>
              <p className="text-xs text-surface-500">Billed monthly based on usage</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-semibold text-white">€0.02</span>
              <span className="text-surface-500 text-sm">/GB/mo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-800 pt-8">
        <h2 className="text-lg font-medium text-white mb-4">Why no per-seat pricing?</h2>
        <p className="text-sm text-surface-400 leading-relaxed mb-6">
          Per-seat pricing punishes collaboration. Add a contractor for a week? That's another seat.
          Onboard an intern? Another seat. We charge for what actually costs money — compute and storage.
          Add as many users as you want.
        </p>

        <h2 className="text-lg font-medium text-white mb-4">Why is SSO included?</h2>
        <p className="text-sm text-surface-400 leading-relaxed mb-6">
          Because it's a security feature, not a luxury. GitHub charges $21/user/month for SAML SSO.
          That's a tax on security. Gittan includes OIDC on every account because your identity provider
          shouldn't be a premium add-on.
        </p>

        <h2 className="text-lg font-medium text-white mb-4">Why are your CI minutes worth more?</h2>
        <p className="text-sm text-surface-400 leading-relaxed">
          GitHub Actions spends 60-90 seconds booting a VM before your code runs. Gittan starts
          containers in under a second with pre-cached images. Your 3-minute GitHub job becomes
          a 90-second Gittan job. You use fewer minutes because we waste less of your time.
        </p>
      </div>
    </div>
  )
}

function Included({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-surface-300">
      <span className="text-accent-400 text-xs">&#10003;</span>
      <span>{text}</span>
    </div>
  )
}
