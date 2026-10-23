export default function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-4 py-6">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 rounded-sm bg-[#F3E9E0]" />
      ))}
    </div>
  );
}
