import { useEffect, useState, useCallback } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"

import { api, type TOrg, type TRepo, type TTeam } from "./api"
import { AdminSidebar } from "./components/layout/AdminSidebar"
import { Header } from "./components/layout/Header"
import { QuotaBanner } from "./components/shared/QuotaBanner"
import { Sidebar } from "./components/layout/Sidebar"
import { AdminAudit } from "./pages/admin/AdminAudit"
import { AdminAuth } from "./pages/admin/AdminOidc"
import { AdminPolicies } from "./pages/admin/AdminPolicies"
import { AdminSettings } from "./pages/admin/AdminSettings"
import { AdminSteps } from "./pages/admin/AdminSteps"
import { AdminSubscription } from "./pages/admin/AdminSubscription"
import { AdminUsage } from "./pages/admin/AdminUsage"
import { AdminTeams } from "./pages/admin/AdminTeams"
import { CodeTab } from "./pages/repo/CodeTab"
import { DependenciesTab } from "./pages/repo/DependenciesTab"
import { PipelinesTab } from "./pages/repo/PipelinesTab"
import { RepoLayout } from "./pages/repo/RepoLayout"
import { SettingsTab } from "./pages/repo/SettingsTab"
import { FaqPage } from "./pages/FaqPage"
import { FlowPage } from "./pages/FlowPage"
import { PricingPage } from "./pages/PricingPage"
import { TeamDashboard } from "./pages/team/TeamDashboard"
import type { ReactNode } from "react"

const STORAGE_KEY = "gittan-active-org"

export default function App() {
  const [orgs, setOrgs] = useState<TOrg[]>([])
  const [activeOrgId, setActiveOrgId] = useState<string>(() =>
    localStorage.getItem(STORAGE_KEY) ?? ""
  )
  const [teams, setTeams] = useState<TTeam[]>([])
  const [reposByTeam, setReposByTeam] = useState<Record<string, TRepo[]>>({})
  const [loading, setLoading] = useState(true)

  const loadOrgData = useCallback(async (orgId: string) => {
    setLoading(true)
    try {
      const t = await api.teams(orgId)
      setTeams(t)

      const repoMap: Record<string, TRepo[]> = {}
      await Promise.all(
        t.map(async (team) => {
          repoMap[team.id] = await api.repos(team.id)
        }),
      )
      setReposByTeam(repoMap)
    } catch (err) {
      console.error("Failed to load org data:", err)
      setTeams([])
      setReposByTeam({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const userOrgs = await api.orgs()
        setOrgs(userOrgs)

        const savedOrg = localStorage.getItem(STORAGE_KEY)
        const resolvedOrgId = userOrgs.find((o) => o.id === savedOrg)?.id
          ?? userOrgs[0]?.id
          ?? ""

        if (resolvedOrgId) {
          setActiveOrgId(resolvedOrgId)
          localStorage.setItem(STORAGE_KEY, resolvedOrgId)
          await loadOrgData(resolvedOrgId)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to load orgs:", err)
        setLoading(false)
      }
    }

    init()
  }, [loadOrgData])

  const handleOrgSwitch = useCallback((orgId: string) => {
    setActiveOrgId(orgId)
    localStorage.setItem(STORAGE_KEY, orgId)
    loadOrgData(orgId)
  }, [loadOrgData])

  const repoCounts = Object.fromEntries(
    Object.entries(reposByTeam).map(([id, repos]) => [id, repos.length]),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 text-surface-300 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-surface-700 border-t-surface-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter basename="/app">
      <div className="min-h-screen bg-surface-950 text-surface-300">
        <Header orgs={orgs} activeOrgId={activeOrgId} onOrgSwitch={handleOrgSwitch} />
        <QuotaBanner orgId={activeOrgId} />
        <Routes>
          <Route path="/flow" element={<FlowPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FaqPage />} />

          <Route path="/admin" element={<Navigate to="/admin/teams" replace />} />
          <Route path="/admin/teams" element={<AdminPage orgId={activeOrgId}><AdminTeams teams={teams} /></AdminPage>} />
          <Route path="/admin/policies" element={<AdminPage orgId={activeOrgId}><AdminPolicies /></AdminPage>} />
          <Route path="/admin/steps" element={<AdminPage orgId={activeOrgId}><AdminSteps /></AdminPage>} />
          <Route path="/admin/auth" element={<AdminPage orgId={activeOrgId}><AdminAuth /></AdminPage>} />
          <Route path="/admin/settings" element={<AdminPage orgId={activeOrgId}><AdminSettings /></AdminPage>} />
          <Route path="/admin/subscription" element={<AdminPage orgId={activeOrgId}><AdminSubscription /></AdminPage>} />
          <Route path="/admin/audit" element={<AdminPage orgId={activeOrgId}><AdminAudit /></AdminPage>} />
          <Route path="/admin/usage" element={<AdminPage orgId={activeOrgId}><AdminUsage /></AdminPage>} />

          <Route element={<TeamLayout teams={teams} repoCounts={repoCounts} />}>
            <Route
              path="/"
              element={
                teams.length > 0 ? (
                  <Navigate to={`/${teams[0].name}`} replace />
                ) : (
                  <div className="p-6 text-surface-500">No teams yet.</div>
                )
              }
            />
            <Route
              path="/:teamName"
              element={<TeamDashboard teams={teams} reposByTeam={reposByTeam} />}
            />
            <Route
              path="/:teamName/:repoName"
              element={<RepoLayout teams={teams} reposByTeam={reposByTeam} />}
            >
              <Route index element={<CodeTab />} />
              <Route path="code/*" element={<CodeTab />} />
              <Route path="pipelines" element={<PipelinesTab />} />
              <Route path="deps" element={<DependenciesTab />} />
              <Route path="settings" element={<SettingsTab />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function TeamLayout({
  teams,
  repoCounts,
}: {
  teams: TTeam[]
  repoCounts: Record<string, number>
}) {
  return (
    <div className="flex">
      <Sidebar teams={teams} repoCounts={repoCounts} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

function AdminPage({ children, orgId }: { children: ReactNode; orgId: string }) {
  return (
    <div className="flex">
      <AdminSidebar orgId={orgId} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
