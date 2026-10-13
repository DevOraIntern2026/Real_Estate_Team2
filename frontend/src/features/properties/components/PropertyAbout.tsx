import type { Property } from '../types/types'

export default function PropertyAbout({ property }: { property: Property }) {
  const { extra } = property
  const rows: Array<[string, string | number | undefined]> = [
    ['Floor', property.floor],
    ['Built up area', property.area],
    ['Number of bedrooms', property.bedrooms],
    ['Number of bathrooms', property.bathrooms],
    ['Finishing', extra?.finishing],
    ['Construction year', extra?.constructionYear],
  ]
  const ordinal = (n: number) =>
    n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`

  return (
    <section className="rounded-outer border-border-grey-shade bg-main-white col-span-2 mb-6 border p-6 lg:mb-0">
      <h2 className="text-title-22 font-semibold text-[#0f0f3d]">
        About Apartment
      </h2>
      <p className="text-label-14 mt-4">{property.description}</p>
      <dl className="text-label-14 mt-4 flex flex-col gap-4">
        {rows.map(([label, value]) =>
          value === undefined ? null : (
            <div key={label} className="flex gap-1">
              <dt>{label}:</dt>
              <dd>{label === 'Floor' ? ordinal(Number(value)) : value}</dd>
            </div>
          ),
        )}
        {extra?.delivery && (
          <div className="flex items-center gap-2">
            <dt>Delivery:</dt>
            <dd className="bg-success-lighter text-success-dark text-caption-10 rounded-full px-2 py-1">
              {extra.delivery}
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
