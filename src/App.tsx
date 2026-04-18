import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NotFoundPage } from './app/NotFoundPage'
import { ProtectedRoute } from './app/guards/ProtectedRoute'
import { PublicOnlyRoute } from './app/guards/PublicOnlyRoute'
import { AppLayout } from './app/layout/AppLayout'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { NotificationsPage } from './features/notifications/NotificationsPage'
import { ProjectDetailsPage } from './features/projects/ProjectDetailsPage'
import { ProjectFormPage } from './features/projects/ProjectFormPage'
import { ProjectsPage } from './features/projects/ProjectsPage'
import { ProjectTasksPage } from './features/tasks/ProjectTasksPage'
import { TaskDetailsPage } from './features/tasks/TaskDetailsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<ProjectFormPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/projects/:projectId/edit" element={<ProjectFormPage />} />
            <Route path="/projects/:projectId/tasks" element={<ProjectTasksPage />} />
            <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
