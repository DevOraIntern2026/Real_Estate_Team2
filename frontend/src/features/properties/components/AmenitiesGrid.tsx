import {
  ArrowUpDown,
  Check,
  Dumbbell,
  Landmark,
  ParkingCircle,
  ShieldCheck,
  Tv,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

const iconFor = (name: string): LucideIcon => {
  const n = name.toLowerCase()
  if (n.includes('elevator')) return ArrowUpDown
  if (n.includes('club')) return Landmark
  if (n.includes('parking')) return ParkingCircle
  if (n.includes('tv')) return Tv
  if (n.includes('wi-fi') || n.includes('wifi') || n.includes('internet'))
    return Wifi
  if (n.includes('pool')) return Waves
  if (n.includes('gym')) return Dumbbell
  if (n.includes('security')) return ShieldCheck
  return Check
}

export default function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null
  return (
    <section className="rounded-outer border-border-grey-shade bg-main-white col-span-2 col-start-1 row-start-2 mb-6 border p-6">
      <h2 className="text-title-22 font-semibold text-[#0f0f3d]">Amenities</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {amenities.map((name, i) => {
          const Icon = iconFor(name)
          const isLastOdd =
            i === amenities.length - 1 && amenities.length % 2 === 1
          return (
            <li
              key={name}
              className={`bg-bg-surface-variant text-title-18 text-text-grey-shade flex items-center gap-3 rounded-lg px-4 py-3 ${isLastOdd ? 'sm:col-span-2' : ''}`}
            >
              <Icon size={20} className="text-icon-grey-shade shrink-0" />
              {name}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
