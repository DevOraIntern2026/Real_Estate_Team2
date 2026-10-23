import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-8 text-center text-ink">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="text-sm text-primary underline">
        Return home
      </Link>
    </main>
  )
}
