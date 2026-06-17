import { useState, useRef, useEffect } from "react"
import type { TOrg } from "../../api"

type OrgSwitcherProps = {
  orgs: TOrg[]
  activeOrgId: string
  onSwitch: (orgId: string) => void
}

export function OrgSwitcher({ orgs, activeOrgId, onSwitch }: OrgSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const activeOrg = orgs.find((o) => o.id === activeOrgId)

  if (orgs.length <= 1) {
    return (
      <span className="text-[11px] text-surface-400 border border-surface-700 px-2 py-0.5 rounded">
        {activeOrg?.displayName ?? activeOrgId}
      </span>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-surface-400 border border-surface-700 px-2 py-0.5 rounded hover:border-surface-500 hover:text-surface-300 transition-colors"
      >
        {activeOrg?.displayName ?? activeOrgId}
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-surface-900 border border-surface-700 rounded-md shadow-xl z-50 py-1">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-surface-500">
            Organizations
          </div>
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                onSwitch(org.id)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-800 transition-colors ${
                org.id === activeOrgId ? "text-white" : "text-surface-400"
              }`}
            >
              <div>
                <div className="text-sm font-medium">{org.displayName}</div>
                <div className="text-[10px] text-surface-500">{org.role}</div>
              </div>
              {org.id === activeOrgId && (
                <svg className="w-4 h-4 text-accent-500" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
