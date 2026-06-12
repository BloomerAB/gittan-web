import { Link, NavLink, Outlet, useParams } from "react-router-dom"

import type { TRepo, TTeam } from "../../api"

export function RepoLayout({
  teams,
  reposByTeam,
}: {
  teams: TTeam[]
  reposByTeam: Record<string, TRepo[]>
}) {
  const { teamName, repoName } = useParams()
  const team = teams.find((t) => t.name === teamName)
  const repos = team ? (reposByTeam[team.id] ?? []) : []
  const repo = repos.find((r) => r.name === repoName)

  if (!repo) {
    return <p className="text-surface-500 p-6">Repository not found.</p>
  }

  const tabClass = (isActive: boolean) =>
    `px-4 py-2.5 text-sm transition-colors ${
      isActive
        ? "text-white border-b-2 border-accent-400"
        : "text-surface-500 hover:text-surface-300"
    }`

  return (
    <div className="p-6">
      {/* Repo header — GitHub style */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-base">
          <Link to={`/${teamName}`} className="text-accent-400 hover:underline">
            {team?.displayName}
          </Link>
          <span className="text-surface-700">/</span>
          <span className="text-white font-semibold">{repo.name}</span>
          {repo.gatedBranches.includes("main") && (
            <span className="text-[11px] text-surface-500 border border-surface-700 px-1.5 py-0.5 rounded-full ml-1">
              gated
            </span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-surface-800 mb-5">
        <NavLink to={`/${teamName}/${repoName}`} end className={({ isActive }) => tabClass(isActive)}>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Z" />
            </svg>
            Code
          </span>
        </NavLink>
        <NavLink to={`/${teamName}/${repoName}/pipelines`} className={({ isActive }) => tabClass(isActive)}>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.5 5.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l5.5-5.5a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z" />
            </svg>
            Pipelines
          </span>
        </NavLink>
        <NavLink to={`/${teamName}/${repoName}/deps`} className={({ isActive }) => tabClass(isActive)}>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.122.392a1.75 1.75 0 0 1 1.756 0l5.25 3.045c.54.313.872.89.872 1.514V7.25a.75.75 0 0 1-1.5 0V5.677L7.75 8.432v6.384a1 1 0 0 1-1.502.865L.872 12.563A1.75 1.75 0 0 1 0 11.049V4.951c0-.624.332-1.2.872-1.514Z" />
            </svg>
            Dependencies
          </span>
        </NavLink>
        <NavLink to={`/${teamName}/${repoName}/settings`} className={({ isActive }) => tabClass(isActive)}>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.3.071L12.7 2.77c.63-.186 1.322.083 1.647.658.29.51.426 1.085.426 1.572 0 .487-.136 1.062-.426 1.572-.325.575-1.017.844-1.647.658l-1.072-.307c-.066-.019-.177-.011-.3.071a5.309 5.309 0 0 1-.668.386c-.133.066-.194.158-.212.224l-.288 1.107c-.17.645-.716 1.195-1.459 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.065-1.289-.615-1.459-1.26l-.288-1.107a.286.286 0 0 0-.212-.224 5.309 5.309 0 0 1-.668-.386c-.123-.082-.233-.09-.3-.071l-1.072.307c-.63.186-1.322-.083-1.647-.658C.856 7.062.72 6.487.72 6c0-.487.136-1.062.426-1.572.325-.575 1.017-.844 1.647-.658l1.072.307c.066.019.177.011.3-.071.214-.143.437-.272.668-.386a.286.286 0 0 0 .212-.224l.288-1.107C5.559.645 6.105.095 6.848.031 7.231.008 7.615 0 8 0Z" />
            </svg>
            Settings
          </span>
        </NavLink>
      </div>

      <Outlet context={{ repo, team }} />
    </div>
  )
}
