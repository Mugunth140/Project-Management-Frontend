import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { projectsApi } from '../../shared/api/services'
import { PRIORITIES, PROJECT_STATUSES } from '../../shared/lib/constants'
import { parseApiError } from '../../shared/lib/errors'
import { toDateInputValue } from '../../shared/lib/format'
import { applyApiValidationErrors } from '../../shared/lib/forms'
import { canCreateProject, canManageProject } from '../../shared/lib/permissions'
import {
  Button,
  ErrorState,
  FieldError,
  Input,
  SectionCard,
  Select,
  Spinner,
  Textarea,
} from '../../shared/ui/base'
import { useAuth } from '../auth/auth-context'
import type { Priority, ProjectStatus } from '../../shared/types/models'

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(PROJECT_STATUSES as [ProjectStatus, ...ProjectStatus[]]),
  priority: z.enum(PRIORITIES as [Priority, ...Priority[]]),
  deadline: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export function ProjectFormPage() {
  const { user } = useAuth()
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const editProjectId = projectId ? Number(projectId) : null
  const isEditMode = Boolean(editProjectId)

  const projectQuery = useQuery({
    queryKey: ['project', editProjectId],
    queryFn: () => projectsApi.get(editProjectId as number),
    enabled: isEditMode,
  })

  const membersQuery = useQuery({
    queryKey: ['project-members', editProjectId],
    queryFn: () => projectsApi.members(editProjectId as number),
    enabled: isEditMode,
  })

  const canAccess = useMemo(() => {
    if (!isEditMode) {
      return canCreateProject(user)
    }

    if (!projectQuery.data) {
      return false
    }

    return canManageProject(user, projectQuery.data, membersQuery.data)
  }, [isEditMode, user, projectQuery.data, membersQuery.data])

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'PLANNING',
      priority: 'MEDIUM',
      deadline: '',
    },
  })

  useEffect(() => {
    if (!projectQuery.data) {
      return
    }

    reset({
      name: projectQuery.data.name,
      description: projectQuery.data.description,
      status: projectQuery.data.status,
      priority: projectQuery.data.priority,
      deadline: toDateInputValue(projectQuery.data.deadline),
    })
  }, [projectQuery.data, reset])

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate(`/projects/${project.id}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: ProjectFormValues) =>
      projectsApi.update(editProjectId as number, {
        ...values,
        deadline: values.deadline || null,
      }),
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      await queryClient.invalidateQueries({ queryKey: ['project', project.id] })
      navigate(`/projects/${project.id}`)
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    const payload = {
      ...values,
      deadline: values.deadline || null,
    }

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(values)
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error) {
      const parsed = parseApiError(error)
      applyApiValidationErrors(parsed, setError)
      setSubmitError(parsed.message)
    }
  })

  if (isEditMode && (projectQuery.isLoading || membersQuery.isLoading)) {
    return (
      <SectionCard title="Project form">
        <Spinner label="Loading project..." />
      </SectionCard>
    )
  }

  if (projectQuery.isError) {
    return (
      <SectionCard title="Project form">
        <ErrorState message={parseApiError(projectQuery.error).message} />
      </SectionCard>
    )
  }

  if (!canAccess) {
    return (
      <SectionCard title="Project form">
        <ErrorState message="You do not have permission to perform this action." />
        <div className="mt-4">
          <Link to="/projects" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            Back to projects
          </Link>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard title={isEditMode ? 'Edit project' : 'Create project'}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-300" htmlFor="name">
            Name
          </label>
          <Input id="name" placeholder="Phoenix Redesign" {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-300" htmlFor="description">
            Description
          </label>
          <Textarea id="description" rows={4} placeholder="Project goals, scope, milestones..." {...register('description')} />
          <FieldError message={errors.description?.message} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="status">
            Status
          </label>
          <Select id="status" {...register('status')}>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="priority">
            Priority
          </label>
          <Select id="priority" {...register('priority')}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="deadline">
            Deadline
          </label>
          <Input id="deadline" type="date" {...register('deadline')} />
        </div>

        {submitError && (
          <div className="md:col-span-2">
            <ErrorState message={submitError} />
          </div>
        )}

        <div className="md:col-span-2 flex items-center gap-3">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {isEditMode
              ? updateMutation.isPending
                ? 'Updating...'
                : 'Update project'
              : createMutation.isPending
                ? 'Creating...'
                : 'Create project'}
          </Button>
          <Link to="/projects" className="text-sm font-semibold text-slate-300 hover:text-slate-100">
            Cancel
          </Link>
        </div>
      </form>
    </SectionCard>
  )
}
