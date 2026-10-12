import type { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function InfoCard({
  title,
  children,
  className = "",
}: InfoCardProps) {
  return (
    <section
      className={`rounded-sm border-[0.8px] border-[#87400E] p-4 ${className}`}
    >
      <h2 className="border-b-[0.8px] border-[#87400E]/40 pb-2 text-sm font-medium text-[#241A12]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
