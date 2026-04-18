import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../../shared/api/services'
import { formatDate, formatDateTime } from '../../shared/lib/format'
import { parseApiError } from '../../shared/lib/errors'
import { EmptyState, ErrorState, Pill, SectionCard, Spinner } from '../../shared/ui/base'
import type { DashboardDto } from '../../shared/types/models'

export function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  })

  if (dashboardQuery.isLoading) {
    return (
      <SectionCard title="Dashboard">
        <Spinner label="Loading dashboard..." />
      </SectionCard>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <SectionCard title="Dashboard">
        <ErrorState message={parseApiError(dashboardQuery.error).message} />
      </SectionCard>
    )
  }

  const dashboard: DashboardDto = dashboardQuery.data ?? {
    totalProjects: 0,
    tasksDueToday: 0,
    completedTasks: 0,
    myTasks: [],
    recentActivities: [],
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-400/20 bg-linear-to-r from-zinc-500/20 via-zinc-900/50 to-zinc-500/15 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-200">Overview</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Team Performance Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-300">
          Track your projects, see what is due today, and jump into urgent tasks quickly.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
          <p className="text-sm text-zinc-300">Total projects</p>
          <p className="mt-1 text-3xl font-bold text-white">{dashboard.totalProjects}</p>
        </section>
        <section className="rounded-2xl border border-zinc-400/20 bg-zinc-500/10 p-4">
          <p className="text-sm text-zinc-100">Tasks due today</p>
          <p className="mt-1 text-3xl font-bold text-zinc-50">{dashboard.tasksDueToday}</p>
        </section>
        <section className="rounded-2xl border border-zinc-400/20 bg-zinc-500/10 p-4">
          <p className="text-sm text-zinc-100">Completed tasks</p>
          <p className="mt-1 text-3xl font-bold text-zinc-50">{dashboard.completedTasks}</p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="My tasks">
          {dashboard.myTasks.length === 0 ? (
            <EmptyState
              title="No tasks assigned"
              subtitle="You are clear for now. New assignments will appear here."
            />
          ) : (
            <ul className="space-y-3">
              {dashboard.myTasks.map((task) => (
                <li key={task.id} className="rounded-xl border border-zinc-700 bg-zinc-950/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/tasks/${task.id}`} className="text-sm font-semibold text-zinc-200 hover:text-zinc-100">
                        {task.title}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-400">Due {formatDate(task.dueDate)}</p>
                    </div>
                    <Pill>{task.status}</Pill>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Recent activity">
          {dashboard.recentActivities.length === 0 ? (
            <EmptyState title="No activity yet" subtitle="Team activity will appear once work starts moving." />
          ) : (
            <ul className="space-y-3">
              {dashboard.recentActivities.map((activity) => (
                <li key={activity.id} className="rounded-xl border border-zinc-700 bg-zinc-950/40 p-3">
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-zinc-400">{activity.user.fullName}</p>
                  <p className="mt-1 text-xs text-zinc-500">{formatDateTime(activity.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
