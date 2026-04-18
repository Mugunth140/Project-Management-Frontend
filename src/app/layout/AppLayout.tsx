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
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl backdrop-blur">
          <Link to="/" className="mb-6 block rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Project OS</p>
            <p className="text-lg font-semibold text-zinc-950">Management Hub</p>
          </Link>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'block rounded-lg px-3 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-sm font-semibold text-zinc-950">{user.fullName}</p>
              <p className="text-xs text-zinc-600">{user.email}</p>
              <div className="mt-2">
                <Pill>{user.role}</Pill>
              </div>
              <button
                onClick={logout}
                className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                Logout
              </button>
            </div>
          )}
        </aside>

        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </PageShell>
  )
}
