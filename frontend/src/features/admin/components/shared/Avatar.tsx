type AvatarProps = {
  name: string;
  src?: string;
  className?: string; // size + text size, e.g. "h-14 w-14 text-base"
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function Avatar({
  name,
  src,
  className = "h-9 w-9 text-xs",
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#F3E9E0] font-medium text-[#87400E] ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
