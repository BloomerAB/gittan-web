import { Link, useParams } from "react-router-dom"

import type { TTeam } from "../../api"

export function Sidebar({
  teams,
  repoCounts,
}: {
  teams: TTeam[]
  repoCounts: Record<string, number>
}) {
  const { teamName } = useParams()

  return (
    <nav className="w-52 border-r border-surface-800 min-h-[calc(100vh-48px)] p-4">
      <p className="text-[11px] text-surface-600 uppercase tracking-wider mb-3">Teams</p>
      {teams.map((team) => {
        const active = teamName === team.name
        return (
          <Link
            key={team.id}
            to={`/${team.name}`}
            className={`block px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
              active
                ? "bg-surface-900 text-white border-l-2 border-accent-400 pl-2.5"
                : "text-surface-400 hover:text-surface-200 hover:bg-surface-900"
            }`}
          >
            <span className="block font-medium leading-snug">{team.displayName}</span>
            <span className="text-[11px] text-surface-600">
              {repoCounts[team.id] ?? 0} repos
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
