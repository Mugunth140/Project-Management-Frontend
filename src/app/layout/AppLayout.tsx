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
        <aside className="h-fit rounded-2xl border border-zinc-500/20 bg-zinc-900/80 p-4 shadow-xl backdrop-blur">
          <Link to="/" className="mb-6 block rounded-xl border border-zinc-400/20 bg-zinc-400/10 px-3 py-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Project OS</p>
            <p className="text-lg font-semibold text-white">Management Hub</p>
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
                      ? 'bg-zinc-300 text-zinc-950'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-950/60 p-3">
              <p className="text-sm font-semibold text-white">{user.fullName}</p>
              <p className="text-xs text-zinc-400">{user.email}</p>
              <div className="mt-2">
                <Pill>{user.role}</Pill>
              </div>
              <button
                onClick={logout}
                className="mt-4 w-full rounded-lg border border-zinc-400/30 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-500/15"
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
