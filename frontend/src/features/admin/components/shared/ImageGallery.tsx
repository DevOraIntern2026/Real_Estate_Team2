import { useState } from "react";

type ImageGalleryProps = {
  images: string[];
  alt: string;
  badge?: string; // e.g. "Rent"
};

export default function ImageGallery({ images, alt, badge }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#F3E9E0]">
        {current ? (
          <img src={current} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-[#87400E]">
            <i className="fa-regular fa-image" aria-label="No image" />
          </div>
        )}
        {badge && (
          <span className="absolute start-3 top-3 rounded-sm bg-[#F3E9E0] px-2 py-1 text-xs font-medium text-[#87400E]">
            {badge}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={`aspect-[4/3] overflow-hidden rounded-sm ${
                i === index ? "ring-2 ring-[#87400E]" : "opacity-80"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
