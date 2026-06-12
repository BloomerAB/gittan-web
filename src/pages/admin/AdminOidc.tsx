export function AdminOidc() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">OIDC Configuration</h2>

      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm text-surface-400 mb-1">Issuer URL</label>
          <input
            type="url"
            placeholder="https://login.microsoftonline.com/tenant-id/v2.0"
            className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-surface-400 mb-1">Client ID</label>
          <input
            type="text"
            placeholder="your-client-id"
            className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-t border-surface-800">
          <div>
            <p className="text-sm text-surface-300">SCIM provisioning</p>
            <p className="text-xs text-surface-600">Sync users and groups from your identity provider</p>
          </div>
          <div className="w-10 h-5 bg-surface-800 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-surface-600 rounded-full absolute top-0.5 left-0.5" />
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-surface-800">
          <div>
            <p className="text-sm text-surface-300">Mandatory SSO</p>
            <p className="text-xs text-red-400/80">Disables password auth for all users</p>
          </div>
          <div className="w-10 h-5 bg-surface-800 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-surface-600 rounded-full absolute top-0.5 left-0.5" />
          </div>
        </div>

        <button className="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
          Save configuration
        </button>
      </div>
    </div>
  )
}
