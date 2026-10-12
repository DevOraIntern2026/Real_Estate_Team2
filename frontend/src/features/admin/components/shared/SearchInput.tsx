type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-sm border-[0.8px] border-[#87400E] px-3 py-2 ${className}`}
    >
      <i className="fa-solid fa-magnifying-glass text-sm text-[#87400E]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-[#5A4F49]"
      />
    </div>
  );
}
