import { useState } from "react"

export function AdminAuth() {
  const [authMode, setAuthMode] = useState<"builtin" | "oidc">("builtin")

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Authentication</h2>

      <div className="max-w-lg space-y-8">
        <section>
          <h3 className="text-sm font-medium text-white mb-3">Authentication method</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setAuthMode("builtin")}
              className={`flex-1 px-4 py-3 rounded-md border text-sm text-left transition-colors ${
                authMode === "builtin"
                  ? "border-accent-400 bg-accent-400/5 text-white"
                  : "border-surface-800 text-surface-400 hover:border-surface-600"
              }`}
            >
              <p className="font-medium">Built-in auth</p>
              <p className="text-xs text-surface-500 mt-1">Email + password. No external IdP needed.</p>
            </button>
            <button
              onClick={() => setAuthMode("oidc")}
              className={`flex-1 px-4 py-3 rounded-md border text-sm text-left transition-colors ${
                authMode === "oidc"
                  ? "border-accent-400 bg-accent-400/5 text-white"
                  : "border-surface-800 text-surface-400 hover:border-surface-600"
              }`}
            >
              <p className="font-medium">OIDC / SSO</p>
              <p className="text-xs text-surface-500 mt-1">Entra ID, Okta, Google, or any OIDC provider.</p>
            </button>
          </div>
        </section>

        {authMode === "builtin" ? (
          <>
            <section className="flex items-center justify-between py-3 border-t border-surface-800">
              <div>
                <p className="text-sm text-surface-300">Allow self-registration</p>
                <p className="text-xs text-surface-600">New users can sign up with email. Otherwise admin invites only.</p>
              </div>
              <div className="w-10 h-5 bg-surface-800 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-surface-600 rounded-full absolute top-0.5 left-0.5" />
              </div>
            </section>

            <section className="flex items-center justify-between py-3 border-t border-surface-800">
              <div>
                <p className="text-sm text-surface-300">Require email verification</p>
                <p className="text-xs text-surface-600">Users must verify email before accessing repos.</p>
              </div>
              <div className="w-10 h-5 bg-accent-500 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
            </section>

            <p className="text-xs text-surface-600 bg-surface-900 border border-surface-800 rounded-md p-3">
              Built-in auth is included at no extra cost. Switch to OIDC anytime — no migration needed,
              users keep their accounts.
            </p>
          </>
        ) : (
          <>
            <section>
              <label className="block text-sm text-surface-400 mb-1">Issuer URL</label>
              <input
                type="url"
                placeholder="https://login.microsoftonline.com/tenant-id/v2.0"
                className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
              />
            </section>

            <section>
              <label className="block text-sm text-surface-400 mb-1">Client ID</label>
              <input
                type="text"
                placeholder="your-client-id"
                className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
              />
            </section>

            <section>
              <label className="block text-sm text-surface-400 mb-1">Groups claim</label>
              <input
                type="text"
                defaultValue="groups"
                className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
              />
              <p className="text-xs text-surface-600 mt-1">
                OIDC claim containing group memberships. Map groups to teams in each team's settings.
              </p>
            </section>

            <section className="flex items-center justify-between py-3 border-t border-surface-800">
              <div>
                <p className="text-sm text-surface-300">Mandatory SSO</p>
                <p className="text-xs text-err-400/80">Disables password auth for all users.</p>
              </div>
              <div className="w-10 h-5 bg-surface-800 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-surface-600 rounded-full absolute top-0.5 left-0.5" />
              </div>
            </section>

            <button className="text-sm bg-surface-800 border border-surface-700 text-surface-300 hover:text-white px-4 py-2 rounded-md transition-colors">
              Test connection
            </button>
          </>
        )}

        <button className="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
          Save configuration
        </button>
      </div>
    </div>
  )
}
