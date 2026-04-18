import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { projectsApi, tasksApi } from '../../shared/api/services'
import { PRIORITIES, TASK_STATUSES } from '../../shared/lib/constants'
import { parseApiError } from '../../shared/lib/errors'
import { bytesToSize, formatDate, formatDateTime, toDateInputValue } from '../../shared/lib/format'
import { canAddComment, canManageTask } from '../../shared/lib/permissions'
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

const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES as [TaskStatus, ...TaskStatus[]]),
  priority: z.enum(PRIORITIES as [Priority, ...Priority[]]),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
})

type CommentFormValues = z.infer<typeof commentSchema>

export function TaskDetailsPage() {
  const { user } = useAuth()
  const { taskId } = useParams()
  const queryClient = useQueryClient()
  const parsedTaskId = Number(taskId)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const taskQuery = useQuery({
    queryKey: ['task', parsedTaskId],
    queryFn: () => tasksApi.get(parsedTaskId),
    enabled: Number.isFinite(parsedTaskId),
  })

  const projectQuery = useQuery({
    queryKey: ['project-from-task', taskQuery.data?.projectId],
    queryFn: () => projectsApi.get(taskQuery.data?.projectId as number),
    enabled: Boolean(taskQuery.data?.projectId),
  })

  const membersQuery = useQuery({
    queryKey: ['project-members-from-task', taskQuery.data?.projectId],
    queryFn: () => projectsApi.members(taskQuery.data?.projectId as number),
    enabled: Boolean(taskQuery.data?.projectId),
  })

  const commentsQuery = useQuery({
    queryKey: ['task-comments', parsedTaskId],
    queryFn: () => tasksApi.comments(parsedTaskId),
    enabled: Number.isFinite(parsedTaskId),
  })

  const activityQuery = useQuery({
    queryKey: ['task-activity', parsedTaskId],
    queryFn: () => tasksApi.taskActivity(parsedTaskId),
    enabled: Number.isFinite(parsedTaskId),
  })

  const attachmentsQuery = useQuery({
    queryKey: ['task-attachments', parsedTaskId],
    queryFn: () => tasksApi.attachments(parsedTaskId),
    enabled: Number.isFinite(parsedTaskId),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  })

  const {
    register: registerComment,
    handleSubmit: handleSubmitComment,
    reset: resetComment,
    formState: { errors: commentErrors, isSubmitting: isCommentSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  })

  useEffect(() => {
    if (!taskQuery.data) {
      return
    }

    reset({
      title: taskQuery.data.title,
      description: taskQuery.data.description,
      status: taskQuery.data.status,
      priority: taskQuery.data.priority,
      dueDate: toDateInputValue(taskQuery.data.dueDate),
      assigneeId: taskQuery.data.assignee?.id ? String(taskQuery.data.assignee.id) : '',
    })
  }, [taskQuery.data, reset])

  const updateTaskMutation = useMutation({
    mutationFn: (values: TaskFormValues) =>
      tasksApi.update(parsedTaskId, {
        title: values.title,
        description: values.description || '',
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || null,
        assigneeId: values.assigneeId ? Number(values.assigneeId) : null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['task', parsedTaskId] }),
        queryClient.invalidateQueries({ queryKey: ['project-tasks'], exact: false }),
        queryClient.invalidateQueries({ queryKey: ['project-kanban'], exact: false }),
      ])
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: () => tasksApi.remove(parsedTaskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-tasks'], exact: false })
      window.history.back()
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => tasksApi.addComment(parsedTaskId, content),
    onSuccess: async () => {
      resetComment({ content: '' })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['task-comments', parsedTaskId] }),
        queryClient.invalidateQueries({ queryKey: ['task-activity', parsedTaskId] }),
      ])
    },
  })

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => tasksApi.uploadAttachment(parsedTaskId, file),
    onSuccess: async () => {
      setAttachmentFile(null)
      await queryClient.invalidateQueries({ queryKey: ['task-attachments', parsedTaskId] })
    },
  })

  const downloadAttachmentMutation = useMutation({
    mutationFn: async ({ attachmentId, fileName }: { attachmentId: number; fileName: string }) => {
      const blob = await tasksApi.downloadAttachment(attachmentId)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)
    },
  })

  const project = projectQuery.data ?? null
  const members = membersQuery.data ?? []
  const task = taskQuery.data

  const canManage = useMemo(() => {
    if (!task) {
      return false
    }
    return canManageTask(user, task, project, members)
  }, [task, user, project, members])

  const canComment = canAddComment(user)

  const assignableUsers = useMemo(() => {
    if (!project) {
      return []
    }

    const map = new Map<number, { id: number; label: string }>()
    map.set(project.owner.id, { id: project.owner.id, label: `${project.owner.fullName} (Owner)` })
    members.forEach((member) => {
      map.set(member.user.id, { id: member.user.id, label: member.user.fullName })
    })
    return Array.from(map.values())
  }, [project, members])

  const onSubmitTask = handleSubmit(async (values) => {
    await updateTaskMutation.mutateAsync(values)
  })

  const onSubmitComment = handleSubmitComment(async (values) => {
    await addCommentMutation.mutateAsync(values.content)
  })

  if (!Number.isFinite(parsedTaskId)) {
    return (
      <SectionCard title="Task details">
        <ErrorState message="Invalid task id." />
      </SectionCard>
    )
  }

  if (
    taskQuery.isLoading ||
    projectQuery.isLoading ||
    membersQuery.isLoading ||
    commentsQuery.isLoading ||
    activityQuery.isLoading ||
    attachmentsQuery.isLoading
  ) {
    return (
      <SectionCard title="Task details">
        <Spinner label="Loading task details..." />
      </SectionCard>
    )
  }

  if (taskQuery.isError) {
    return (
      <SectionCard title="Task details">
        <ErrorState message={parseApiError(taskQuery.error).message} />
      </SectionCard>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-700">Task details</p>
            <h1 className="text-2xl font-bold text-zinc-950">{task?.title}</h1>
            <p className="mt-1 text-sm text-zinc-600">Project: {project?.name ?? 'Unknown'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Pill>{task?.status}</Pill>
            <Pill tone={task?.priority === 'HIGH' ? 'danger' : task?.priority === 'MEDIUM' ? 'warning' : 'default'}>
              {task?.priority}
            </Pill>
          </div>
        </div>

        <div className="mt-4 text-sm text-zinc-600">
          <p>Assignee: {task?.assignee?.fullName ?? 'Unassigned'}</p>
          <p>Due date: {formatDate(task?.dueDate)}</p>
          <p>Updated: {formatDateTime(task?.updatedAt)}</p>
        </div>

        {project && (
          <div className="mt-4">
            <Link to={`/projects/${project.id}/tasks`}>
              <Button variant="ghost">Back to board</Button>
            </Link>
          </div>
        )}
      </section>

      {canManage && (
        <SectionCard title="Edit task">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmitTask}>
            <div className="md:col-span-2">
              <Input placeholder="Task title" {...register('title')} />
              <FieldError message={errors.title?.message} />
            </div>
            <div className="md:col-span-2">
              <Textarea rows={4} placeholder="Task description" {...register('description')} />
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
                {assignableUsers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting || updateTaskMutation.isPending}>
                {updateTaskMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => deleteTaskMutation.mutate()}
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete task'}
              </Button>
            </div>
          </form>

          {updateTaskMutation.isError && (
            <div className="mt-3">
              <ErrorState message={parseApiError(updateTaskMutation.error).message} />
            </div>
          )}
          {deleteTaskMutation.isError && (
            <div className="mt-3">
              <ErrorState message={parseApiError(deleteTaskMutation.error).message} />
            </div>
          )}
        </SectionCard>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Comments">
          {canComment ? (
            <form className="mb-4 space-y-2" onSubmit={onSubmitComment}>
              <Textarea rows={3} placeholder="Write a comment..." {...registerComment('content')} />
              <FieldError message={commentErrors.content?.message} />
              <Button type="submit" disabled={isCommentSubmitting || addCommentMutation.isPending}>
                {addCommentMutation.isPending ? 'Posting...' : 'Post comment'}
              </Button>
            </form>
          ) : (
            <p className="mb-3 text-sm text-zinc-600">Your role cannot post comments.</p>
          )}

          {addCommentMutation.isError && (
            <ErrorState message={parseApiError(addCommentMutation.error).message} />
          )}

          {(commentsQuery.data ?? []).length === 0 ? (
            <EmptyState title="No comments" subtitle="Conversation on this task will appear here." />
          ) : (
            <ul className="space-y-2">
              {(commentsQuery.data ?? []).map((comment) => (
                <li key={comment.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                  <p className="text-sm text-zinc-900">{comment.content}</p>
                  <p className="mt-1 text-xs text-zinc-600">{comment.user.fullName}</p>
                  <p className="mt-1 text-xs text-zinc-9500">{formatDateTime(comment.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Activity">
          {(activityQuery.data ?? []).length === 0 ? (
            <EmptyState title="No activity" subtitle="Activity logs will appear for status and field changes." />
          ) : (
            <ul className="space-y-2">
              {(activityQuery.data ?? []).map((entry) => (
                <li key={entry.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                  <p className="text-sm text-zinc-900">{entry.action}</p>
                  <p className="mt-1 text-xs text-zinc-600">{entry.user.fullName}</p>
                  <p className="mt-1 text-xs text-zinc-9500">{formatDateTime(entry.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Attachments">
          <div className="mb-3 space-y-2">
            <Input
              type="file"
              onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              onClick={() => {
                if (attachmentFile) {
                  uploadAttachmentMutation.mutate(attachmentFile)
                }
              }}
              disabled={!attachmentFile || uploadAttachmentMutation.isPending}
            >
              {uploadAttachmentMutation.isPending ? 'Uploading...' : 'Upload file'}
            </Button>
          </div>

          {uploadAttachmentMutation.isError && (
            <ErrorState message={parseApiError(uploadAttachmentMutation.error).message} />
          )}

          {(attachmentsQuery.data ?? []).length === 0 ? (
            <EmptyState title="No attachments" subtitle="Upload files related to this task." />
          ) : (
            <ul className="space-y-2">
              {(attachmentsQuery.data ?? []).map((attachment) => (
                <li key={attachment.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                  <p className="text-sm font-semibold text-zinc-900">{attachment.fileName}</p>
                  <p className="mt-1 text-xs text-zinc-600">{bytesToSize(attachment.fileSize)}</p>
                  <p className="mt-1 text-xs text-zinc-9500">{formatDateTime(attachment.createdAt)}</p>
                  <Button
                    variant="ghost"
                    className="mt-2 px-3 py-1 text-xs"
                    onClick={() =>
                      downloadAttachmentMutation.mutate({
                        attachmentId: attachment.id,
                        fileName: attachment.fileName,
                      })
                    }
                  >
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
