import Chip from "../../../components/shared/Chip";
import { iconFor } from "../constants";

type TagSectionProps = {
  title: string;
  items: string[];
  icons: Record<string, string>;
};

export default function TagSection({ title, items, icons }: TagSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium text-[#241A12]">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <Chip key={item} label={item} icon={iconFor(icons, item)} />
        ))}
      </div>
    </section>
  );
}
