import { Link, useLocation } from "react-router-dom"

import type { THealth } from "../../api"
import { GittanLogo } from "../shared/GittanLogo"

export function Header({ health, orgId }: { health: THealth | null; orgId: string }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith("/admin")

  return (
    <header className="border-b border-surface-800 px-6 h-12 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-surface-200 transition-colors">
          <GittanLogo size={22} />
          <span className="text-lg font-semibold tracking-tight">gittan</span>
        </Link>
        <span className="text-[11px] text-surface-600 border border-surface-800 px-2 py-0.5 rounded">
          {orgId}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {health && (
          <div className="flex items-center gap-3">
            {health.dependencies.map((dep) => (
              <span
                key={dep.name}
                className={`text-[11px] ${dep.healthy ? "text-emerald-500" : "text-red-500"}`}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                  style={{ backgroundColor: dep.healthy ? "rgb(16 185 129)" : "rgb(239 68 68)" }} />
                {dep.name}
              </span>
            ))}
          </div>
        )}
        <Link
          to={isAdmin ? "/" : "/admin"}
          className="text-surface-500 hover:text-surface-300 text-sm"
          title={isAdmin ? "Back to dashboard" : "Administration"}
        >
          {isAdmin ? "Dashboard" : "Admin"}
        </Link>
      </div>
    </header>
  )
}
