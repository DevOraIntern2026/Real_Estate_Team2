import { getPageItems } from "./paginationItems";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

const box =
  "flex h-8 min-w-8 items-center justify-center rounded-sm border-[0.8px] border-[#87400E] px-2 text-sm";

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${box} text-[#87400E] disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <i className="fa-solid fa-chevron-left text-xs rtl:rotate-180" />
      </button>

      {getPageItems(page, totalPages).map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-[#87400E]">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={`${box} ${item === page ? "bg-[#87400E] text-[#FAFAFA]" : "text-[#87400E]"}`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={`${box} text-[#87400E] disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <i className="fa-solid fa-chevron-right text-xs rtl:rotate-180" />
      </button>
    </nav>
  );
}
