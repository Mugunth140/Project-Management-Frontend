import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { projectsApi } from '../../shared/api/services'
import { parseApiError } from '../../shared/lib/errors'
import { formatDate } from '../../shared/lib/format'
import { canCreateProject } from '../../shared/lib/permissions'
import { Button, EmptyState, ErrorState, Pill, SectionCard, Spinner } from '../../shared/ui/base'
import { useAuth } from '../auth/auth-context'

export function ProjectsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const handleDelete = (projectId: number) => {
    const confirmed = window.confirm('Delete this project? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    deleteMutation.mutate(projectId)
  }

  return (
    <SectionCard
      title="Projects"
      action={
        canCreateProject(user) ? (
          <Link to="/projects/new">
            <Button>Create project</Button>
          </Link>
        ) : undefined
      }
    >
      {projectsQuery.isLoading && <Spinner label="Loading projects..." />}

      {projectsQuery.isError && <ErrorState message={parseApiError(projectsQuery.error).message} />}

      {deleteMutation.isError && <ErrorState message={parseApiError(deleteMutation.error).message} />}

      {projectsQuery.isSuccess && projectsQuery.data.length === 0 && (
        <EmptyState
          title="No projects yet"
          subtitle={
            canCreateProject(user)
              ? 'Create your first project to start planning work.'
              : 'No projects are visible to your account yet.'
          }
        />
      )}

      {projectsQuery.isSuccess && projectsQuery.data.length > 0 && (
        <div className="space-y-3">
          {projectsQuery.data.map((project) => {
            const canDeleteOrEdit =
              Boolean(user) && (user.role === 'ADMIN' || user.id === project.owner.id)

            return (
              <article
                key={project.id}
                className="rounded-xl border border-slate-700 bg-slate-950/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-lg font-semibold text-cyan-200 hover:text-cyan-100"
                    >
                      {project.name}
                    </Link>
                    <p className="mt-1 max-w-2xl text-sm text-slate-400">{project.description || 'No description'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>{project.status}</Pill>
                    <Pill tone={project.priority === 'HIGH' ? 'danger' : project.priority === 'MEDIUM' ? 'warning' : 'default'}>
                      {project.priority}
                    </Pill>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <p>
                    Owner: <span className="text-slate-200">{project.owner.fullName}</span>
                  </p>
                  <p>{project.membersCount} members</p>
                  <p>Deadline: {formatDate(project.deadline)}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link to={`/projects/${project.id}`}>
                    <Button variant="ghost">Open</Button>
                  </Link>
                  <Link to={`/projects/${project.id}/tasks`}>
                    <Button variant="ghost">Tasks</Button>
                  </Link>
                  {canDeleteOrEdit && (
                    <>
                      <Link to={`/projects/${project.id}/edit`}>
                        <Button variant="secondary">Edit</Button>
                      </Link>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(project.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
