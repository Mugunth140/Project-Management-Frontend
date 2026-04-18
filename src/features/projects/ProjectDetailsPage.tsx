import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { projectsApi, tasksApi } from '../../shared/api/services'
import { PROJECT_MEMBER_ROLES } from '../../shared/lib/constants'
import { parseApiError } from '../../shared/lib/errors'
import { formatDateTime } from '../../shared/lib/format'
import { canManageProject } from '../../shared/lib/permissions'
import {
  Button,
  EmptyState,
  ErrorState,
  FieldError,
  Input,
  Pill,
  SectionCard,
  Select,
  Spinner,
} from '../../shared/ui/base'
import { useAuth } from '../auth/auth-context'
import type { ProjectMemberRole } from '../../shared/types/models'

const addMemberSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(PROJECT_MEMBER_ROLES as [ProjectMemberRole, ...ProjectMemberRole[]]).optional(),
})

type AddMemberForm = z.infer<typeof addMemberSchema>

export function ProjectDetailsPage() {
  const { user } = useAuth()
  const { projectId } = useParams()
  const queryClient = useQueryClient()

  const parsedProjectId = Number(projectId)

  const projectQuery = useQuery({
    queryKey: ['project', parsedProjectId],
    queryFn: () => projectsApi.get(parsedProjectId),
  })

  const membersQuery = useQuery({
    queryKey: ['project-members', parsedProjectId],
    queryFn: () => projectsApi.members(parsedProjectId),
  })

  const tasksQuery = useQuery({
    queryKey: ['project-tasks', parsedProjectId, 'preview'],
    queryFn: () => tasksApi.list({ projectId: parsedProjectId }),
  })

  const activityQuery = useQuery({
    queryKey: ['project-activity', parsedProjectId],
    queryFn: () => projectsApi.activity(parsedProjectId),
  })

  const addMemberMutation = useMutation({
    mutationFn: (payload: AddMemberForm) => projectsApi.addMember(parsedProjectId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project-members', parsedProjectId] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
      ])
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => projectsApi.removeMember(parsedProjectId, userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project-members', parsedProjectId] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
      ])
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { role: 'DEVELOPER' },
  })

  const onAddMember = handleSubmit(async (values) => {
    await addMemberMutation.mutateAsync(values)
    reset({ email: '', role: values.role ?? 'DEVELOPER' })
  })

  if (Number.isNaN(parsedProjectId)) {
    return (
      <SectionCard title="Project details">
        <ErrorState message="Invalid project id." />
      </SectionCard>
    )
  }

  if (projectQuery.isLoading || membersQuery.isLoading || tasksQuery.isLoading || activityQuery.isLoading) {
    return (
      <SectionCard title="Project details">
        <Spinner label="Loading project..." />
      </SectionCard>
    )
  }

  if (projectQuery.isError) {
    return (
      <SectionCard title="Project details">
        <ErrorState message={parseApiError(projectQuery.error).message} />
      </SectionCard>
    )
  }

  const project = projectQuery.data
  if (!project) {
    return (
      <SectionCard title="Project details">
        <ErrorState message="Project not found." />
      </SectionCard>
    )
  }

  const members = membersQuery.data ?? []
  const tasks = tasksQuery.data ?? []
  const activity = activityQuery.data ?? []
  const canManage = canManageProject(user, project, members)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Project</p>
            <h1 className="mt-1 text-2xl font-bold text-white">{project.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{project.description || 'No description yet.'}</p>
          </div>
          <div className="flex gap-2">
            <Pill>{project.status}</Pill>
            <Pill tone={project.priority === 'HIGH' ? 'danger' : project.priority === 'MEDIUM' ? 'warning' : 'default'}>
              {project.priority}
            </Pill>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <p>
            Owner: <span className="text-slate-100">{project.owner.fullName}</span>
          </p>
          <p>Members: {members.length}</p>
          <p>Updated: {formatDateTime(project.updatedAt)}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/projects/${project.id}/tasks`}>
            <Button>Open task board</Button>
          </Link>
          {canManage && (
            <Link to={`/projects/${project.id}/edit`}>
              <Button variant="secondary">Edit project</Button>
            </Link>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Members">
          {canManage && (
            <form className="mb-4 grid gap-3" onSubmit={onAddMember}>
              <div>
                <Input placeholder="teammate@company.dev" {...register('email')} />
                <FieldError message={errors.email?.message} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
                <Select {...register('role')}>
                  {PROJECT_MEMBER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
                <Button type="submit" disabled={isSubmitting || addMemberMutation.isPending}>
                  {addMemberMutation.isPending ? 'Adding...' : 'Add member'}
                </Button>
              </div>
            </form>
          )}

          {addMemberMutation.isError && <ErrorState message={parseApiError(addMemberMutation.error).message} />}
          {removeMemberMutation.isError && <ErrorState message={parseApiError(removeMemberMutation.error).message} />}

          {members.length === 0 ? (
            <EmptyState title="No members" subtitle="Invite members to collaborate on this project." />
          ) : (
            <ul className="space-y-2">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/40 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{member.user.fullName}</p>
                    <p className="text-xs text-slate-400">{member.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill>{member.role}</Pill>
                    {canManage && member.user.id !== project.owner.id && (
                      <Button
                        variant="danger"
                        className="px-2 py-1 text-xs"
                        onClick={() => removeMemberMutation.mutate(member.user.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Tasks"
          action={
            <Link to={`/projects/${project.id}/tasks`} className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
              View all
            </Link>
          }
        >
          {tasks.length === 0 ? (
            <EmptyState title="No tasks" subtitle="Create tasks from the project task board." />
          ) : (
            <ul className="space-y-2">
              {tasks.slice(0, 6).map((task) => (
                <li key={task.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/tasks/${task.id}`} className="text-sm font-semibold text-cyan-100 hover:text-cyan-50">
                      {task.title}
                    </Link>
                    <Pill>{task.status}</Pill>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Assignee: {task.assignee?.fullName ?? 'Unassigned'}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Project activity">
        {activity.length === 0 ? (
          <EmptyState title="No activity" subtitle="Activity logs will appear as actions happen." />
        ) : (
          <ul className="space-y-2">
            {activity.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                <p className="text-sm text-slate-100">{entry.action}</p>
                <p className="mt-1 text-xs text-slate-400">{entry.user.fullName}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(entry.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
