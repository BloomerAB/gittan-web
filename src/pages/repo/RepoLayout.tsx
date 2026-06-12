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
              <path fillRule="evenodd" d="M7.429 1.525a3.5 3.5 0 0 1 1.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.326.183.463.276.474.322.991.468 1.543.288l1.073-.308c.11-.03.175.016.195.046.219.39.33.807.33 1.233 0 .426-.111.843-.33 1.233-.02.03-.085.076-.195.046l-1.073-.308c-.552-.18-1.069-.034-1.543.288a4.3 4.3 0 0 1-.463.276c-.447.222-.85.629-.997 1.189l-.289 1.105c-.029.11-.1.143-.137.146a3.5 3.5 0 0 1-1.142 0c-.036-.003-.108-.037-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a4.074 4.074 0 0 1-.463-.276c-.474-.322-.991-.468-1.543-.288l-1.073.308c-.11.03-.175-.016-.195-.046a2.96 2.96 0 0 1-.33-1.233c0-.426.111-.843.33-1.233.02-.03.085-.076.195-.046l1.073.308c.552.18 1.069.034 1.543-.288.137-.093.29-.19.463-.276.447-.222.85-.629.997-1.189l.289-1.105c.029-.11.1-.143.137-.146ZM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
            Settings
          </span>
        </NavLink>
      </div>

      <Outlet context={{ repo, team }} />
    </div>
  )
}
