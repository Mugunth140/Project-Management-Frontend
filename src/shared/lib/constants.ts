import type { Priority, ProjectMemberRole, ProjectStatus, TaskStatus, UserRole } from '../types/models'

export const USER_ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER']
export const PROJECT_STATUSES: ProjectStatus[] = [
  'PLANNING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
]
export const TASK_STATUSES: TaskStatus[] = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
]
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH']
export const PROJECT_MEMBER_ROLES: ProjectMemberRole[] = [
  'MANAGER',
  'DEVELOPER',
  'VIEWER',
]
