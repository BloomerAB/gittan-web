import { useState } from "react"

import type { TTeam } from "../../api"

type TMember = {
  userId: string
  role: "team-admin" | "writer" | "reader"
  addedAt: string
  addedBy: string
}

const mockMembers: Record<string, TMember[]> = {}

export function AdminTeamDetail({ team }: { team: TTeam }) {
  const [members] = useState<TMember[]>(mockMembers[team.id] ?? [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<TMember["role"]>("writer")

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-white">{team.displayName}</h2>
        <span className="text-xs text-surface-600 font-mono">{team.name}</span>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Team info */}
        <section className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-surface-600 mb-1">Display name</label>
            <input
              type="text"
              defaultValue={team.displayName}
              className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 focus:border-surface-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-surface-600 mb-1">Slack channel</label>
            <input
              type="text"
              defaultValue={team.slackChannel ?? ""}
              placeholder="#team-alerts"
              className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
            />
          </div>
        </section>

        {/* OIDC group mapping */}
        <section className="border-t border-surface-800 pt-6">
          <h3 className="text-sm font-medium text-white mb-1">OIDC group mapping</h3>
          <p className="text-xs text-surface-600 mb-3">
            Map an AD/Entra/Okta group to this team. Group membership is read from the
            OIDC <code className="text-surface-500">groups</code> claim at login — no SCIM needed.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Group ID or name from IdP"
              className="flex-1 bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
            />
            <select className="bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-400 focus:border-surface-600 focus:outline-none">
              <option value="writer">writer</option>
              <option value="team-admin">team-admin</option>
              <option value="reader">reader</option>
            </select>
          </div>
          <p className="text-xs text-surface-600 mt-2">
            Users in the mapped group get this role at login. Manually added members keep their individual role.
          </p>
        </section>

        {/* Members */}
        <section className="border-t border-surface-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">
              Members ({members.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              Add member
            </button>
          </div>

          {showAddForm && (
            <div className="flex gap-2 mb-4 p-3 bg-surface-900 border border-surface-800 rounded-md">
              <input
                type="email"
                placeholder="user@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-300 placeholder:text-surface-700 focus:border-surface-600 focus:outline-none"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as TMember["role"])}
                className="bg-surface-950 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-400 focus:border-surface-600 focus:outline-none"
              >
                <option value="writer">writer</option>
                <option value="team-admin">team-admin</option>
                <option value="reader">reader</option>
              </select>
              <button className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-3 py-2 rounded-md transition-colors">
                Add
              </button>
            </div>
          )}

          {members.length === 0 ? (
            <div className="bg-surface-900 border border-surface-800 rounded-md p-6 text-center">
              <p className="text-sm text-surface-500">No members yet.</p>
              <p className="text-xs text-surface-600 mt-1">
                Add members manually or connect an AD group above.
              </p>
            </div>
          ) : (
            <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-surface-800 text-[11px] text-surface-600 uppercase tracking-wider">
                <span>User</span>
                <span>Role</span>
                <span>Added</span>
                <span></span>
              </div>
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-surface-800/60 last:border-b-0 items-center text-sm"
                >
                  <span className="text-surface-300">{m.userId}</span>
                  <span>
                    <select
                      defaultValue={m.role}
                      className="bg-transparent border border-surface-800 rounded px-2 py-1 text-xs text-surface-400 focus:border-surface-600 focus:outline-none"
                    >
                      <option value="writer">writer</option>
                      <option value="team-admin">team-admin</option>
                      <option value="reader">reader</option>
                    </select>
                  </span>
                  <span className="text-xs text-surface-600">{m.addedBy}</span>
                  <span className="text-right">
                    <button className="text-xs text-red-400/70 hover:text-red-400">
                      Remove
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex gap-3 border-t border-surface-800 pt-6">
          <button className="bg-accent-600 hover:bg-accent-500 text-white text-sm px-4 py-2 rounded-md transition-colors">
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
