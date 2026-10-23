import type { ReactNode } from "react";

type EmptyStateProps = {
  image: string;
  imageAlt?: string;
  title: string;
  description?: string;
  /** e.g. an "Add Property" button under the text */
  action?: ReactNode;
};

export default function EmptyState({
  image,
  imageAlt = "",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <img src={image} alt={imageAlt} className="w-full max-w-md" />
      <div>
        <p className="text-sm font-medium text-[#241A12]">{title}</p>
        {description && <p className="mt-1 text-sm text-[#5A4F49]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
