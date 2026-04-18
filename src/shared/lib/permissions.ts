import type {
  ProjectDto,
  ProjectMemberDto,
  TaskDto,
  UserDto,
  UserRole,
} from '../types/models'

export function hasRole(user: UserDto | null, roles: UserRole[]): boolean {
  if (!user) {
    return false
  }
  return roles.includes(user.role)
}

export function canCreateProject(user: UserDto | null): boolean {
  return hasRole(user, ['ADMIN', 'MANAGER'])
}

export function isProjectOwner(user: UserDto | null, project: ProjectDto | null): boolean {
  if (!user || !project) {
    return false
  }
  return user.id === project.owner.id
}

export function getProjectMemberRole(
  user: UserDto | null,
  members: ProjectMemberDto[] | undefined,
): ProjectMemberDto['role'] | null {
  if (!user || !members) {
    return null
  }

  const membership = members.find((member) => member.user.id === user.id)
  return membership?.role ?? null
}

export function canManageProject(
  user: UserDto | null,
  project: ProjectDto | null,
  members?: ProjectMemberDto[],
): boolean {
  if (!user || !project) {
    return false
  }

  if (user.role === 'ADMIN' || user.id === project.owner.id) {
    return true
  }

  const memberRole = getProjectMemberRole(user, members)
  return memberRole === 'MANAGER'
}

export function canManageTask(
  user: UserDto | null,
  task: TaskDto,
  project: ProjectDto | null,
  members?: ProjectMemberDto[],
): boolean {
  if (!user || !project) {
    return false
  }

  if (user.role === 'ADMIN' || user.id === project.owner.id) {
    return true
  }

  if (task.assignee?.id === user.id) {
    return true
  }

  return getProjectMemberRole(user, members) === 'MANAGER'
}

export function canAddComment(user: UserDto | null): boolean {
  if (!user) {
    return false
  }
  return user.role !== 'VIEWER'
}
