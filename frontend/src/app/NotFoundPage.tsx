import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFFAF5] p-8 text-center text-[#241A12]">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-[#5A4F49]">The page you are looking for does not exist.</p>
      <Link to="/" className="text-sm text-[#87400E] underline">
        Return home
      </Link>
    </main>
  )
}
