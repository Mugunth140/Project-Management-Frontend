import { apiClient } from './client'
import type {
  ActivityLogDto,
  AddProjectMemberRequest,
  AttachmentDto,
  AuthResponse,
  CommentDto,
  DashboardDto,
  LoginRequest,
  NotificationDto,
  ProjectCreateUpdateRequest,
  ProjectDto,
  ProjectMemberDto,
  RegisterRequest,
  TaskCreateUpdateRequest,
  TaskDto,
  UserDto,
} from '../types/models'

export const authApi = {
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
    return data
  },
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
    return data
  },
}

export const usersApi = {
  me: async (): Promise<UserDto> => {
    const { data } = await apiClient.get<UserDto>('/users/me')
    return data
  },
}

export const projectsApi = {
  list: async (): Promise<ProjectDto[]> => {
    const { data } = await apiClient.get<ProjectDto[]>('/projects')
    return data
  },
  get: async (projectId: number): Promise<ProjectDto> => {
    const { data } = await apiClient.get<ProjectDto>(`/projects/${projectId}`)
    return data
  },
  create: async (payload: ProjectCreateUpdateRequest): Promise<ProjectDto> => {
    const { data } = await apiClient.post<ProjectDto>('/projects', payload)
    return data
  },
  update: async (
    projectId: number,
    payload: ProjectCreateUpdateRequest,
  ): Promise<ProjectDto> => {
    const { data } = await apiClient.put<ProjectDto>(`/projects/${projectId}`, payload)
    return data
  },
  remove: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`)
  },
  members: async (projectId: number): Promise<ProjectMemberDto[]> => {
    const { data } = await apiClient.get<ProjectMemberDto[]>(
      `/projects/${projectId}/members`,
    )
    return data
  },
  addMember: async (
    projectId: number,
    payload: AddProjectMemberRequest,
  ): Promise<ProjectMemberDto> => {
    const { data } = await apiClient.post<ProjectMemberDto>(
      `/projects/${projectId}/members`,
      payload,
    )
    return data
  },
  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`)
  },
  activity: async (projectId: number): Promise<ActivityLogDto[]> => {
    const { data } = await apiClient.get<ActivityLogDto[]>(
      `/projects/${projectId}/activity`,
    )
    return data
  },
}

export const tasksApi = {
  list: async (params: {
    projectId: number
    status?: string
    assigneeId?: number
  }): Promise<TaskDto[]> => {
    const { data } = await apiClient.get<TaskDto[]>(
      `/projects/${params.projectId}/tasks`,
      {
        params: {
          status: params.status || undefined,
          assigneeId: params.assigneeId || undefined,
        },
      },
    )

    return data
  },
  kanban: async (projectId: number): Promise<TaskDto[]> => {
    const { data } = await apiClient.get<TaskDto[]>(
      `/projects/${projectId}/tasks/kanban`,
    )
    return data
  },
  create: async (
    projectId: number,
    payload: TaskCreateUpdateRequest,
  ): Promise<TaskDto> => {
    const { data } = await apiClient.post<TaskDto>(
      `/projects/${projectId}/tasks`,
      payload,
    )
    return data
  },
  get: async (taskId: number): Promise<TaskDto> => {
    const { data } = await apiClient.get<TaskDto>(`/tasks/${taskId}`)
    return data
  },
  update: async (taskId: number, payload: TaskCreateUpdateRequest): Promise<TaskDto> => {
    const { data } = await apiClient.put<TaskDto>(`/tasks/${taskId}`, payload)
    return data
  },
  remove: async (taskId: number): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`)
  },
  comments: async (taskId: number): Promise<CommentDto[]> => {
    const { data } = await apiClient.get<CommentDto[]>(`/tasks/${taskId}/comments`)
    return data
  },
  addComment: async (taskId: number, content: string): Promise<CommentDto> => {
    const { data } = await apiClient.post<CommentDto>(`/tasks/${taskId}/comments`, {
      content,
    })
    return data
  },
  taskActivity: async (taskId: number): Promise<ActivityLogDto[]> => {
    const { data } = await apiClient.get<ActivityLogDto[]>(`/tasks/${taskId}/activity`)
    return data
  },
  attachments: async (taskId: number): Promise<AttachmentDto[]> => {
    const { data } = await apiClient.get<AttachmentDto[]>(
      `/tasks/${taskId}/attachments`,
    )
    return data
  },
  uploadAttachment: async (taskId: number, file: File): Promise<AttachmentDto> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<AttachmentDto>(
      `/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return data
  },
  downloadAttachment: async (attachmentId: number): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(
      `/attachments/${attachmentId}/download`,
      { responseType: 'blob' },
    )
    return data
  },
}

export const dashboardApi = {
  get: async (): Promise<DashboardDto> => {
    const { data } = await apiClient.get<DashboardDto>('/dashboard')
    return data
  },
}

export const notificationsApi = {
  list: async (): Promise<NotificationDto[]> => {
    const { data } = await apiClient.get<NotificationDto[]>('/notifications')
    return data
  },
  markRead: async (notificationId: number): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`)
  },
  markAllRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all')
  },
}
