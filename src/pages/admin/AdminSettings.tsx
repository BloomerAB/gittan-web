export function AdminSettings() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Organization Settings</h2>

      <div className="space-y-8 max-w-lg">
        <section>
          <h3 className="text-sm font-medium text-white mb-1">Organization name</h3>
          <p className="text-xs text-surface-600 mb-2">Display name shown in the header and team views.</p>
          <input
            type="text"
            defaultValue="Bloomer AB"
            className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
          />
        </section>

        <section>
          <h3 className="text-sm font-medium text-white mb-1">Image tag format</h3>
          <p className="text-xs text-surface-600 mb-2">
            Enforced format for container image tags pushed to the registry.
          </p>
          <div className="bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-400">
            YYYYMMDD-HHMMSS-sha
          </div>
          <p className="text-xs text-surface-600 mt-1">
            Example: <code className="text-surface-500 text-xs">20260612-143022-a1b2c3d</code>
          </p>
        </section>

        <section className="flex items-center justify-between py-3 border-t border-surface-800">
          <div>
            <p className="text-sm text-surface-300">Allow <code className="text-xs bg-surface-800 px-1 rounded">latest</code> tag</p>
            <p className="text-xs text-err-400/80">Not recommended. Breaks reproducibility.</p>
          </div>
          <div className="w-10 h-5 bg-surface-800 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-surface-600 rounded-full absolute top-0.5 left-0.5" />
          </div>
        </section>

        <section className="flex items-center justify-between py-3 border-t border-surface-800">
          <div>
            <p className="text-sm text-surface-300">Public repositories</p>
            <p className="text-xs text-surface-600">Allow repos to be readable without authentication.</p>
          </div>
          <div className="w-10 h-5 bg-accent-500 rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" />
          </div>
        </section>

        <button className="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
          Save settings
        </button>
      </div>
    </div>
  )
}
