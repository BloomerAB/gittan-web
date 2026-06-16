import { Link, useLocation } from "react-router-dom"

import { GittanLogo } from "../shared/GittanLogo"

export function Header({ orgId }: { orgId: string }) {
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
        <Link to="/pricing" className="text-surface-500 hover:text-surface-300 text-sm">
          Pricing
        </Link>
        <Link
          to={isAdmin ? "/" : "/admin"}
          className="text-surface-500 hover:text-surface-300 text-sm"
          title={isAdmin ? "Back to dashboard" : "Administration"}
        >
          {isAdmin ? "Dashboard" : "Admin"}
        </Link>
        <a
          href="/oauth/authorize?response_type=code&client_id=gittan-web&redirect_uri=https://gittan.eu/auth/callback&scope=openid+profile+email"
          className="text-sm bg-accent-600 hover:bg-accent-500 text-white px-3 py-1.5 rounded-md transition-colors"
        >
          Log in
        </a>
      </div>
    </header>
  )
}
