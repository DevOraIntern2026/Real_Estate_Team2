import type { ReactNode } from "react";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="border-b-[0.8px] border-[#87400E]/60 pb-3 text-sm font-medium text-[#241A12]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
