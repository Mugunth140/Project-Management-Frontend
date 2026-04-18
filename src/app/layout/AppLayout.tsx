import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { PageShell, Pill } from '../../shared/ui/base'

const navigation = [
  { to: '/', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/notifications', label: 'Notifications' },
]

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <PageShell>
      <header className="mb-6 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex flex-col items-center gap-0">
                <img src="favicon.svg" alt="logo" className="h-8 w-8" />
            </Link>

            <nav className="flex flex-wrap items-center gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [
                      'rounded-md px-3 py-1.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-zinc-950">{user.fullName}</p>
                <p className="text-xs text-zinc-600">{user.email}</p>
              </div>
              <Pill>{user.role}</Pill>
              <button
                onClick={logout}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="space-y-6">
        <Outlet />
      </main>
    </PageShell>
  )
}
