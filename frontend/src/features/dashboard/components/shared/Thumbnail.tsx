import { useState } from "react";

type ThumbnailProps = { src?: string | null; alt: string; className?: string };

/** Image that falls back to an icon when the URL is missing or fails to load. */
export default function Thumbnail({ src, alt, className = "h-14 w-16" }: ThumbnailProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-sm bg-[#F3E9E0] text-[#87400E] ${className}`}
      >
        <i className="fa-regular fa-image" role="img" aria-label="No image" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-sm object-cover ${className}`}
    />
  );
}
