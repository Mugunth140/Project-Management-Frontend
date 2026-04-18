import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { projectsApi, tasksApi } from '../../shared/api/services'
import { PRIORITIES, TASK_STATUSES } from '../../shared/lib/constants'
import { parseApiError } from '../../shared/lib/errors'
import { formatDate } from '../../shared/lib/format'
import {
  canManageProject,
  canManageTask,
  getProjectMemberRole,
} from '../../shared/lib/permissions'
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
  Textarea,
} from '../../shared/ui/base'
import { useAuth } from '../auth/auth-context'
import type { Priority, TaskStatus } from '../../shared/types/models'

const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES as [TaskStatus, ...TaskStatus[]]),
  priority: z.enum(PRIORITIES as [Priority, ...Priority[]]),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
})

type CreateTaskFormValues = z.infer<typeof createTaskSchema>

type TaskBoardView = 'LIST' | 'KANBAN'

export function ProjectTasksPage() {
  const { user } = useAuth()
  const { projectId } = useParams()
  const queryClient = useQueryClient()

  const parsedProjectId = Number(projectId)
  const [view, setView] = useState<TaskBoardView>('LIST')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('')

  const projectQuery = useQuery({
    queryKey: ['project', parsedProjectId],
    queryFn: () => projectsApi.get(parsedProjectId),
    enabled: Number.isFinite(parsedProjectId),
  })

  const membersQuery = useQuery({
    queryKey: ['project-members', parsedProjectId],
    queryFn: () => projectsApi.members(parsedProjectId),
    enabled: Number.isFinite(parsedProjectId),
  })

  const tasksQuery = useQuery({
    queryKey: ['project-tasks', parsedProjectId, statusFilter, assigneeFilter],
    queryFn: () =>
      tasksApi.list({
        projectId: parsedProjectId,
        status: statusFilter || undefined,
        assigneeId: assigneeFilter ? Number(assigneeFilter) : undefined,
      }),
    enabled: Number.isFinite(parsedProjectId),
  })

  const kanbanQuery = useQuery({
    queryKey: ['project-kanban', parsedProjectId],
    queryFn: () => tasksApi.kanban(parsedProjectId),
    enabled: Number.isFinite(parsedProjectId),
  })

  const members = membersQuery.data ?? []
  const project = projectQuery.data ?? null

  const canManageProjectTasks = canManageProject(user, project, members)
  const canCreateTasks = user
    ? user.role !== 'VIEWER' && canManageProjectTasks
    : false

  const assignableUsers = useMemo(() => {
    if (!project) {
      return []
    }

    const map = new Map<number, { id: number; fullName: string }>()
    map.set(project.owner.id, {
      id: project.owner.id,
      fullName: `${project.owner.fullName} (Owner)`,
    })

    members.forEach((member) => {
      map.set(member.user.id, {
        id: member.user.id,
        fullName: member.user.fullName,
      })
    })

    return Array.from(map.values())
  }, [project, members])

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      assigneeId: '',
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: (values: CreateTaskFormValues) =>
      tasksApi.create(parsedProjectId, {
        title: values.title,
        description: values.description || '',
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || null,
        assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['project-tasks', parsedProjectId],
          exact: false,
        }),
        queryClient.invalidateQueries({ queryKey: ['project-kanban', parsedProjectId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) => {
      const source = (tasksQuery.data ?? []).find((task) => task.id === taskId)
      if (!source) {
        throw new Error('Task data not loaded')
      }

      return tasksApi.update(taskId, {
        title: source.title,
        description: source.description || '',
        status,
        priority: source.priority,
        dueDate: source.dueDate,
        position: source.position,
        assigneeId: source.assignee?.id ?? null,
      })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['project-tasks', parsedProjectId],
          exact: false,
        }),
        queryClient.invalidateQueries({ queryKey: ['project-kanban', parsedProjectId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['project-tasks', parsedProjectId],
          exact: false,
        }),
        queryClient.invalidateQueries({ queryKey: ['project-kanban', parsedProjectId] }),
      ])
    },
  })

  const onCreateTask = handleSubmit(async (values) => {
    try {
      await createTaskMutation.mutateAsync(values)
      reset({
        title: '',
        description: '',
        status: values.status,
        priority: values.priority,
        dueDate: '',
        assigneeId: '',
      })
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateTaskFormValues, { message })
        })
      }
    }
  })

  const baseError =
    parseApiError(projectQuery.error).message ||
    parseApiError(tasksQuery.error).message ||
    parseApiError(kanbanQuery.error).message

  if (!Number.isFinite(parsedProjectId)) {
    return (
      <SectionCard title="Project tasks">
        <ErrorState message="Invalid project id." />
      </SectionCard>
    )
  }

  if (projectQuery.isLoading || tasksQuery.isLoading || membersQuery.isLoading || kanbanQuery.isLoading) {
    return (
      <SectionCard title="Project tasks">
        <Spinner label="Loading tasks..." />
      </SectionCard>
    )
  }

  if (projectQuery.isError || tasksQuery.isError || kanbanQuery.isError) {
    return (
      <SectionCard title="Project tasks">
        <ErrorState message={baseError} />
      </SectionCard>
    )
  }

  const taskData = tasksQuery.data ?? []
  const kanbanTasks = kanbanQuery.data ?? []
  const memberRole = getProjectMemberRole(user, members)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Task board</p>
            <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
            {memberRole && <p className="text-sm text-slate-400">Your project role: {memberRole}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant={view === 'LIST' ? 'primary' : 'ghost'} onClick={() => setView('LIST')}>
              List
            </Button>
            <Button variant={view === 'KANBAN' ? 'primary' : 'ghost'} onClick={() => setView('KANBAN')}>
              Kanban
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link to={`/projects/${parsedProjectId}`}>
            <Button variant="ghost">Back to project</Button>
          </Link>
        </div>
      </section>

      <SectionCard title="Filters">
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          <Select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
            <option value="">All assignees</option>
            {assignableUsers.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.fullName}
              </option>
            ))}
          </Select>
        </div>
      </SectionCard>

      {canCreateTasks && (
        <SectionCard title="Create task">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onCreateTask}>
            <div className="md:col-span-2">
              <Input placeholder="Task title" {...register('title')} />
              <FieldError message={errors.title?.message} />
            </div>
            <div className="md:col-span-2">
              <Textarea rows={3} placeholder="Task description" {...register('description')} />
            </div>
            <div>
              <Select {...register('status')}>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Select {...register('priority')}>
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Input type="date" {...register('dueDate')} />
            </div>
            <div>
              <Select {...register('assigneeId')}>
                <option value="">Unassigned</option>
                {assignableUsers.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting || createTaskMutation.isPending}>
                {createTaskMutation.isPending ? 'Creating...' : 'Create task'}
              </Button>
            </div>
          </form>
          {createTaskMutation.isError && (
            <div className="mt-3">
              <ErrorState message={parseApiError(createTaskMutation.error).message} />
            </div>
          )}
        </SectionCard>
      )}

      {deleteTaskMutation.isError && <ErrorState message={parseApiError(deleteTaskMutation.error).message} />}
      {updateStatusMutation.isError && <ErrorState message={parseApiError(updateStatusMutation.error).message} />}

      {view === 'LIST' && (
        <SectionCard title="Task list">
          {taskData.length === 0 ? (
            <EmptyState title="No tasks" subtitle="Try changing filters or creating a new task." />
          ) : (
            <ul className="space-y-3">
              {taskData.map((task) => {
                const canManageThisTask = canManageTask(user, task, project, members)

                return (
                  <li key={task.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link to={`/tasks/${task.id}`} className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                          {task.title}
                        </Link>
                        <p className="mt-1 text-xs text-slate-400">{task.description || 'No description'}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Assignee: {task.assignee?.fullName ?? 'Unassigned'} | Due: {formatDate(task.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill>{task.priority}</Pill>
                        {canManageThisTask ? (
                          <Select
                            className="w-[155px]"
                            value={task.status}
                            onChange={(event) =>
                              updateStatusMutation.mutate({
                                taskId: task.id,
                                status: event.target.value as TaskStatus,
                              })
                            }
                          >
                            {TASK_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Pill>{task.status}</Pill>
                        )}
                        {canManageThisTask && (
                          <Button
                            variant="danger"
                            className="px-2 py-1 text-xs"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      )}

      {view === 'KANBAN' && (
        <section className="grid gap-4 xl:grid-cols-4">
          {TASK_STATUSES.map((status) => {
            const tasksForStatus = kanbanTasks.filter((task) => task.status === status)

            return (
              <article key={status} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                <h2 className="mb-3 text-sm font-semibold text-cyan-100">{status}</h2>
                {tasksForStatus.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-500">
                    No tasks in this column.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {tasksForStatus.map((task) => (
                      <li key={task.id} className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
                        <Link to={`/tasks/${task.id}`} className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                          {task.title}
                        </Link>
                        <p className="mt-1 text-xs text-slate-400">{task.assignee?.fullName ?? 'Unassigned'}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
