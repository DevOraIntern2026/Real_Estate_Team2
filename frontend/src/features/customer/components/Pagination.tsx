import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';

interface Props { page: number; total: number; limit: number; onChange: (p: number) => void }

export function Pagination({ page, total, limit, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="border-border-grey-shade mt-6 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
      <p className="text-label-14 text-text-grey-shade">Showing {from} to {to} of {total} inquiries</p>
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="rounded-button border-border-grey-shade text-text-grey-dark h-12 border px-6 disabled:text-text-grey-light disabled:bg-bg-surface"
        >
          Previous
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page}
            className={clsx(
              'h-12 w-12 rounded-full',
              p === page ? 'bg-main-primary text-main-white' : 'bg-bg-surface-variant text-text-grey-dark',
            )}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
          className="text-main-primary flex items-center gap-1 px-2 disabled:opacity-40"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
