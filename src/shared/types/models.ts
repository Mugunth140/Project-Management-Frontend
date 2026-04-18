export type UserRole = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'VIEWER'
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type ProjectMemberRole = 'MANAGER' | 'DEVELOPER' | 'VIEWER'

export interface UserDto {
  id: number
  email: string
  fullName: string
  role: UserRole
}

export interface ProjectDto {
  id: number
  name: string
  description: string
  status: ProjectStatus
  priority: Priority
  deadline: string | null
  owner: UserDto
  membersCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectMemberDto {
  id: number
  user: UserDto
  role: ProjectMemberRole
  joinedAt: string
}

export interface TaskDto {
  id: number
  projectId: number
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  position: number | null
  assignee: UserDto | null
  createdBy: UserDto
  createdAt: string
  updatedAt: string
}

export interface CommentDto {
  id: number
  taskId: number
  user: UserDto
  content: string
  createdAt: string
  updatedAt: string
}

export interface ActivityLogDto {
  id: number
  projectId: number | null
  taskId: number | null
  user: UserDto
  action: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
}

export interface NotificationDto {
  id: number
  type: string
  message: string
  refId: number | null
  refType: string | null
  isRead: boolean
  createdAt: string
}

export interface AttachmentDto {
  id: number
  taskId: number
  fileName: string
  filePath: string
  mimeType: string
  fileSize: number
  uploadedBy: UserDto
  createdAt: string
}

export interface DashboardDto {
  totalProjects: number
  tasksDueToday: number
  completedTasks: number
  myTasks: TaskDto[]
  recentActivities: ActivityLogDto[]
}

export interface ApiErrorResponse {
  timestamp?: string
  status?: number
  message?: string
  fieldErrors?: Record<string, string>
}

export interface AuthResponse {
  token: string
  user: UserDto
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  role?: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ProjectCreateUpdateRequest {
  name: string
  description: string
  status?: ProjectStatus
  priority?: Priority
  deadline?: string | null
}

export interface AddProjectMemberRequest {
  email: string
  role?: ProjectMemberRole
}

export interface TaskCreateUpdateRequest {
  title: string
  description: string
  status?: TaskStatus
  priority?: Priority
  dueDate?: string | null
  position?: number | null
  assigneeId?: number | null
}
