import { Link, useLocation } from "react-router-dom"

const adminLinks = [
  { path: "/admin/teams", label: "Teams" },
  { path: "/admin/policies", label: "Policies" },
  { path: "/admin/steps", label: "Step Registry" },
  { path: "/admin/auth", label: "Authentication" },
  { path: "/admin/settings", label: "Settings" },
  { path: "/admin/audit", label: "Audit Log" },
]

export function AdminSidebar() {
  const location = useLocation()

  return (
    <nav className="w-52 border-r border-surface-800 min-h-[calc(100vh-48px)] p-4">
      <p className="text-[11px] text-surface-600 uppercase tracking-wider mb-3">
        Administration
      </p>
      {adminLinks.map((link) => {
        const active = location.pathname.startsWith(link.path)
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
              active
                ? "bg-surface-900 text-white border-l-2 border-accent-400 pl-2.5"
                : "text-surface-400 hover:text-surface-200 hover:bg-surface-900"
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
