import { Star } from 'lucide-react';

export default function StarRating({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-1" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < value ? 'text-brand-yellow' : 'text-icon-grey-lighter'}
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
    </span>
  );
}
