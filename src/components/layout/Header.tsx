import { Link, useLocation } from "react-router-dom"

import { GittanLogo } from "../shared/GittanLogo"
import { OrgSwitcher } from "./OrgSwitcher"
import type { TOrg } from "../../api"

type HeaderProps = {
  orgs: TOrg[]
  activeOrgId: string
  onOrgSwitch: (orgId: string) => void
}

export function Header({ orgs, activeOrgId, onOrgSwitch }: HeaderProps) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith("/admin")

  return (
    <header className="border-b border-surface-800 px-6 h-12 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-surface-200 transition-colors">
          <GittanLogo size={22} />
          <span className="text-lg font-semibold tracking-tight">gittan</span>
        </Link>
        <OrgSwitcher orgs={orgs} activeOrgId={activeOrgId} onSwitch={onOrgSwitch} />
      </div>

      <div className="flex items-center gap-4">
        <Link
          to={isAdmin ? "/" : "/admin"}
          className="text-surface-500 hover:text-surface-300 text-sm"
          title={isAdmin ? "Back to dashboard" : "Administration"}
        >
          {isAdmin ? "Dashboard" : "Admin"}
        </Link>
        <a
          href="/auth/logout"
          className="text-surface-500 hover:text-surface-300 text-sm"
        >
          Log out
        </a>
      </div>
    </header>
  )
}
