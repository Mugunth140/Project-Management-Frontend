import { Link } from 'react-router-dom'
import { Button, SectionCard } from '../shared/ui/base'

export function NotFoundPage() {
  return (
    <SectionCard title="Page not found">
      <p className="text-sm text-zinc-700">The page you requested does not exist.</p>
      <div className="mt-4">
        <Link to="/">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </SectionCard>
  )
}
