import { useState } from "react"

import type { TTeam } from "../../api"
import { AdminTeamDetail } from "./AdminTeamDetail"

export function AdminTeams({ teams }: { teams: TTeam[] }) {
  const [selectedTeam, setSelectedTeam] = useState<TTeam | null>(null)

  if (selectedTeam) {
    return (
      <div>
        <div className="px-6 pt-4">
          <button
            onClick={() => setSelectedTeam(null)}
            className="text-sm text-surface-500 hover:text-surface-300 transition-colors"
          >
            ← Back to teams
          </button>
        </div>
        <AdminTeamDetail team={selectedTeam} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Teams</h2>
        <button className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-md transition-colors">
          Create team
        </button>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-md overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-surface-800 text-[11px] text-surface-600 uppercase tracking-wider">
          <span>Name</span>
          <span>Display name</span>
          <span>Slack</span>
          <span>Created</span>
        </div>
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelectedTeam(team)}
            className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-surface-800/60 last:border-b-0 hover:bg-surface-800/30 text-sm w-full text-left transition-colors"
          >
            <span className="text-surface-300 font-mono">{team.name}</span>
            <span className="text-surface-400">{team.displayName}</span>
            <span className="text-surface-500">{team.slackChannel ?? "—"}</span>
            <span className="text-surface-600">{new Date(team.createdAt).toLocaleDateString()}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
