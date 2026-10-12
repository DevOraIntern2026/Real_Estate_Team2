import { useState, type Dispatch, type SetStateAction } from 'react'

export type SearchCriteria = {
  lookingFor: string[]
  areas: string[]
  propertyTypes: string[]
  bedrooms: string
  bathrooms: string
  price: number
  unitArea: number
  finishing: string[]
  amenities: string[]
}

export const initialSearchCriteria: SearchCriteria = {
  lookingFor: ['For Rent'], areas: ['New Cairo', 'Ain Sokhna'], propertyTypes: ['Apartement', 'Villa'],
  bedrooms: '', bathrooms: '', price: 450000000, unitArea: 400, finishing: ['Fully finished', 'Not finished core shell'], amenities: ['Garden', 'bicycles lanes'],
}

type Props = { criteria: SearchCriteria; setCriteria: Dispatch<SetStateAction<SearchCriteria>>; onApply?: () => void }

const filterOptions = {
  lookingFor: ['For Rent', 'For Buy'],
  areas: ['New Cairo', 'Future City', 'Ain Sokhna', 'New Heliopolis', 'Sheikh Zayed', '6th of October'],
  propertyTypes: ['Apartement', 'Villa', 'Duplex'],
  finishing: ['Fully finished', 'Semi finished', 'Not finished core shell', 'Fully finished furnished', 'Flexi finishing', 'Premium', 'White box', 'Luxury', 'Ultra-luxury'],
  amenities: ['Garden', 'Has roof', 'bicycles lanes', 'Disability support', 'Swimming pool', 'Parking'],
}

const groupTitles: Record<keyof typeof filterOptions, string> = {
  lookingFor: 'Looking for', areas: 'Areas', propertyTypes: 'Property Type', finishing: 'Finishing', amenities: 'Amenities',
}

export function SearchFilters({ criteria, setCriteria, onApply }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (key: 'lookingFor' | 'areas' | 'propertyTypes' | 'finishing' | 'amenities', value: string) => {
    setCriteria((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }))
  }
  const resetGroup = (key: keyof typeof filterOptions) => setCriteria((current) => ({ ...current, [key]: [] }))
  const renderGroup = (key: keyof typeof filterOptions) => (
    <section key={key}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-search-filter-heading font-bold text-text-grey-dark">{groupTitles[key]}</h2>
        {key !== 'lookingFor' && <button className="text-search-filter-reset text-text-grey-light underline" onClick={() => resetGroup(key)} type="button">Reset</button>}
      </div>
      <div className="flex flex-col gap-1">
        {filterOptions[key].map((option, index) => (
          <label className={`cursor-pointer items-center justify-between gap-2 text-search-filter-option text-text-grey-shade ${(key === 'areas' || key === 'amenities') && index > 3 && !expanded[key] ? 'hidden' : 'flex'}`} key={option}>
            <span>{option}</span>
            <input checked={criteria[key].includes(option)} className="size-search-checkbox cursor-pointer accent-brand-700" onChange={() => toggle(key, option)} type="checkbox" />
          </label>
        ))}
      </div>
      {(key === 'areas' || key === 'amenities') && <button className="mt-1 text-search-filter-reset font-medium text-brand-700" onClick={() => setExpanded((current) => ({ ...current, [key]: !current[key] }))} type="button">{expanded[key] ? 'Show less' : 'Show all'}</button>}
    </section>
  )

  return (
    <aside aria-label="Property filters" className="rounded-search-panel border border-border-grey-shade bg-white p-search-filter-panel">
      <h1 className="text-search-filter-title font-bold text-landing-text-heading">Filters</h1>
      <div className="mt-5 flex flex-col gap-search-filter-group">
        {(['lookingFor', 'areas', 'propertyTypes'] as const).map(renderGroup)}
      </div>

      <section className="mt-search-filter-group">
        <h2 className="mb-2 text-search-filter-heading font-bold text-text-grey-dark">Bedrooms</h2>
        <div className="flex justify-between gap-1">
          {['1', '2', '3', '4', '5+'].map((value) => <button aria-pressed={criteria.bedrooms === value} className={`size-search-choice rounded-full border border-border-grey-shade text-search-choice ${criteria.bedrooms === value ? 'border-brand-700 bg-brand-50 text-brand-700' : 'bg-white text-text-grey-shade'}`} key={value} onClick={() => setCriteria((current) => ({ ...current, bedrooms: current.bedrooms === value ? '' : value }))} type="button">{value}</button>)}
        </div>
      </section>
      <section className="mt-search-filter-group">
        <h2 className="mb-2 text-search-filter-heading font-bold text-text-grey-dark">Bathrooms</h2>
        <div className="flex justify-between gap-1">
          {['0', '1', '2', '3', '4'].map((value) => <button aria-pressed={criteria.bathrooms === value} className={`size-search-choice rounded-full border border-border-grey-shade text-search-choice ${criteria.bathrooms === value ? 'border-brand-700 bg-brand-50 text-brand-700' : 'bg-white text-text-grey-shade'}`} key={value} onClick={() => setCriteria((current) => ({ ...current, bathrooms: current.bathrooms === value ? '' : value }))} type="button">{value}</button>)}
        </div>
      </section>
      <RangeFilter label="Price Range" minimum="25,000" maximum="450,000,000" value={criteria.price} max={450000000} onChange={(price) => setCriteria((current) => ({ ...current, price }))} />
      <RangeFilter label="Unit Area" minimum="50" maximum="400" value={criteria.unitArea} max={400} onChange={(unitArea) => setCriteria((current) => ({ ...current, unitArea }))} />
      <div className="mt-search-filter-group flex flex-col gap-search-filter-group">
        {(['finishing', 'amenities'] as const).map(renderGroup)}
      </div>
      <button className="mt-6 h-search-apply w-full rounded-button bg-brand-700 text-label-14 font-medium text-white transition-colors hover:bg-brand-800" onClick={onApply} type="button">Apply</button>
    </aside>
  )
}

function RangeFilter({ label, minimum, maximum, value, max, onChange }: { label: string; minimum: string; maximum: string; value: number; max: number; onChange: (value: number) => void }) {
  return (
    <section className="mt-search-filter-group">
      <h2 className="mb-2 text-search-filter-heading font-bold text-text-grey-dark">{label}</h2>
      <input aria-label={label} className="search-range w-full accent-brand-700" max={max} min={label === 'Price Range' ? 25000 : 50} onChange={(event) => onChange(Number(event.target.value))} type="range" value={value} />
      <div className="mt-2 flex justify-between text-search-range text-text-grey-shade"><span><span className="block font-medium text-text-grey-dark">Minimum</span>{minimum}</span><span><span className="block font-medium text-text-grey-dark">Maximum</span>{label === 'Price Range' ? value.toLocaleString('en-US') : maximum}</span></div>
    </section>
  )
}
