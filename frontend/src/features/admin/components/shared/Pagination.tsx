type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-6 flex justify-end gap-3">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`h-8 w-8 rounded-sm border-[0.8px] border-[#87400E] text-sm ${
            n === page ? "bg-[#87400E] text-[#FAFAFA]" : "text-[#87400E]"
          }`}
        >
          {n}
        </button>
      ))}
    </nav>
  );
}
