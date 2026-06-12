export function AdminSubscription() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Subscription</h2>

      <div className="max-w-lg space-y-8">
        {/* Current plan */}
        <section className="bg-surface-900 border border-surface-800 rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">Gittan</h3>
              <p className="text-xs text-surface-600 mt-0.5">Flat rate + usage overages</p>
            </div>
            <span className="text-2xl font-semibold text-white">€19<span className="text-sm text-surface-500 font-normal">/mo</span></span>
          </div>
          <div className="text-xs text-surface-500 space-y-1">
            <p>Includes: 3 users, 10 GB storage, 1000 CI minutes</p>
            <p>OIDC/SSO included at no extra cost</p>
            <p>Additional users: free (no per-seat pricing)</p>
          </div>
        </section>

        {/* Current usage */}
        <section>
          <h3 className="text-sm font-medium text-white mb-3">Current usage</h3>
          <div className="space-y-3">
            <UsageBar label="Users" current={2} included={3} unit="" />
            <UsageBar label="Storage" current={0.1} included={10} unit="GB" />
            <UsageBar label="CI minutes" current={0} included={1000} unit="min" />
            <UsageBar label="Bandwidth" current={0} included={50} unit="GB" />
          </div>
        </section>

        {/* Overage pricing */}
        <section className="border-t border-surface-800 pt-6">
          <h3 className="text-sm font-medium text-white mb-3">Overage pricing</h3>
          <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden text-sm">
            <div className="grid grid-cols-2 px-4 py-2 border-b border-surface-800/60">
              <span className="text-surface-500">Storage</span>
              <span className="text-surface-300">€0.02/GB/mo</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 border-b border-surface-800/60">
              <span className="text-surface-500">CI compute</span>
              <span className="text-surface-300">€0.03/min</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2">
              <span className="text-surface-500">Bandwidth</span>
              <span className="text-surface-300">€0.01/GB</span>
            </div>
          </div>
        </section>

        {/* Billing */}
        <section className="border-t border-surface-800 pt-6">
          <h3 className="text-sm font-medium text-white mb-3">Billing</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-surface-500">Payment method</span>
              <span className="text-surface-300">Visa ****4242</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Next invoice</span>
              <span className="text-surface-300">Jul 12, 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Billing email</span>
              <span className="text-surface-300">billing@bloomer.se</span>
            </div>
          </div>
          <button className="mt-4 text-sm text-surface-500 hover:text-surface-300 underline transition-colors">
            Update payment method
          </button>
        </section>
      </div>
    </div>
  )
}

function UsageBar({
  label,
  current,
  included,
  unit,
}: {
  label: string
  current: number
  included: number
  unit: string
}) {
  const pct = Math.min((current / included) * 100, 100)
  const isOver = current > included
  const barColor = isOver ? "bg-red-400" : pct > 80 ? "bg-yellow-400" : "bg-accent-400"

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-surface-400">{label}</span>
        <span className={isOver ? "text-red-400" : "text-surface-500"}>
          {current}{unit} / {included}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
