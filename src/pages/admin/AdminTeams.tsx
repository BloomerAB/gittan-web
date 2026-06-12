import type { TTeam } from "../../api"

export function AdminTeams({ teams }: { teams: TTeam[] }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Teams</h2>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-surface-800 text-[11px] text-surface-600 uppercase tracking-wider">
          <span>Name</span>
          <span>Display name</span>
          <span>Slack</span>
          <span>Created</span>
        </div>
        {teams.map((team) => (
          <div
            key={team.id}
            className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-surface-800 last:border-b-0 hover:bg-surface-800/30 text-sm"
          >
            <span className="text-surface-300 font-mono">{team.name}</span>
            <span className="text-surface-400">{team.displayName}</span>
            <span className="text-surface-500">{team.slackChannel ?? "—"}</span>
            <span className="text-surface-600">{new Date(team.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
