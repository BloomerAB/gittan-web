import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"

import { api, type TRepo, type TTeam } from "./api"
import { AdminSidebar } from "./components/layout/AdminSidebar"
import { Header } from "./components/layout/Header"
import { Sidebar } from "./components/layout/Sidebar"
import { AdminAudit } from "./pages/admin/AdminAudit"
import { AdminAuth } from "./pages/admin/AdminOidc"
import { AdminPolicies } from "./pages/admin/AdminPolicies"
import { AdminSettings } from "./pages/admin/AdminSettings"
import { AdminSteps } from "./pages/admin/AdminSteps"
import { AdminSubscription } from "./pages/admin/AdminSubscription"
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

const ORG_ID = "bloomer"

export default function App() {
  const [teams, setTeams] = useState<TTeam[]>([])
  const [reposByTeam, setReposByTeam] = useState<Record<string, TRepo[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const t = await api.teams(ORG_ID)
        setTeams(t)

        const repoMap: Record<string, TRepo[]> = {}
        await Promise.all(
          t.map(async (team) => {
            repoMap[team.id] = await api.repos(team.id)
          }),
        )
        setReposByTeam(repoMap)
      } catch (err) {
        console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

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
    <BrowserRouter>
      <div className="min-h-screen bg-surface-950 text-surface-300">
        <Header orgId={ORG_ID} />
        <Routes>
          <Route path="/flow" element={<FlowPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FaqPage />} />

          <Route path="/admin" element={<Navigate to="/admin/teams" replace />} />
          <Route path="/admin/teams" element={<AdminPage><AdminTeams teams={teams} /></AdminPage>} />
          <Route path="/admin/policies" element={<AdminPage><AdminPolicies /></AdminPage>} />
          <Route path="/admin/steps" element={<AdminPage><AdminSteps /></AdminPage>} />
          <Route path="/admin/auth" element={<AdminPage><AdminAuth /></AdminPage>} />
          <Route path="/admin/settings" element={<AdminPage><AdminSettings /></AdminPage>} />
          <Route path="/admin/subscription" element={<AdminPage><AdminSubscription /></AdminPage>} />
          <Route path="/admin/audit" element={<AdminPage><AdminAudit /></AdminPage>} />

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

function AdminPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
