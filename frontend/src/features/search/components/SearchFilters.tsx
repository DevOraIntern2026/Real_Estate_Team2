import { useState, type Dispatch, type SetStateAction } from 'react'
import type { SearchFilterMetadata } from '@/features/search/types/search'

export type SearchCriteria = {
  lookingFor: string[]
  areas: string[]
  propertyTypes: string[]
  bedrooms: string
  bathrooms: string
  minPrice: number | undefined
  maxPrice: number | undefined
  minArea: number | undefined
  maxArea: number | undefined
  finishing: string[]
  amenities: string[]
}

export const initialSearchCriteria: SearchCriteria = {
  lookingFor: [],
  areas: [],
  propertyTypes: [],
  bedrooms: '',
  bathrooms: '',
  minPrice: undefined,
  maxPrice: undefined,
  minArea: undefined,
  maxArea: undefined,
  finishing: [],
  amenities: [],
}

type FilterGroup = 'lookingFor' | 'areas' | 'propertyTypes' | 'finishing' | 'amenities'
type Props = {
  criteria: SearchCriteria
  filters?: SearchFilterMetadata
  setCriteria: Dispatch<SetStateAction<SearchCriteria>>
  onApply?: () => void
}

const groupTitles: Record<FilterGroup, string> = {
  lookingFor: 'Looking for',
  areas: 'Areas',
  propertyTypes: 'Property Type',
  finishing: 'Finishing',
  amenities: 'Amenities',
}

export function SearchFilters({ criteria, filters, setCriteria, onApply }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const filterOptions: Record<FilterGroup, { value: string; label: string }[]> = {
    lookingFor: (filters?.lookingFor ?? []).map(({ value, label }) => ({ value: String(value), label })),
    areas: (filters?.areas ?? []).map((value) => ({ value, label: value })),
    propertyTypes: (filters?.propertyTypes ?? []).map(({ value, label }) => ({ value: String(value), label })),
    finishing: (filters?.finishing ?? []).map(({ value, label }) => ({ value: String(value), label })),
    amenities: (filters?.amenities ?? []).map((value) => ({ value, label: value })),
  }

  const toggle = (key: FilterGroup, value: string) => {
    setCriteria((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }))
  }

  const resetGroup = (key: FilterGroup) => setCriteria((current) => ({ ...current, [key]: [] }))
  const renderGroup = (key: FilterGroup) => (
    <section key={key}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-search-filter-heading font-bold text-text-grey-dark">{groupTitles[key]}</h2>
        {key !== 'lookingFor' && <button className="text-search-filter-reset text-text-grey-light underline" onClick={() => resetGroup(key)} type="button">Reset</button>}
      </div>
      <div className="flex flex-col gap-1">
        {filterOptions[key].map(({ value, label }, index) => (
          <label className={`cursor-pointer items-center justify-between gap-2 text-search-filter-option text-text-grey-shade ${(key === 'areas' || key === 'amenities') && index > 3 && !expanded[key] ? 'hidden' : 'flex'}`} key={value}>
            <span>{label}</span>
            <input checked={criteria[key].includes(value)} className="size-search-checkbox cursor-pointer accent-brand-700" onChange={() => toggle(key, value)} type="checkbox" />
          </label>
        ))}
        {filterOptions[key].length === 0 && <p className="text-search-filter-option text-text-grey-light">No options available</p>}
      </div>
      {(key === 'areas' || key === 'amenities') && filterOptions[key].length > 4 && <button className="mt-1 text-search-filter-reset font-medium text-brand-700" onClick={() => setExpanded((current) => ({ ...current, [key]: !current[key] }))} type="button">{expanded[key] ? 'Show less' : 'Show all'}</button>}
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
          {(filters?.bedrooms ?? []).map((value) => <button aria-pressed={criteria.bedrooms === String(value)} className={`size-search-choice rounded-full border border-border-grey-shade text-search-choice ${criteria.bedrooms === String(value) ? 'border-brand-700 bg-brand-50 text-brand-700' : 'bg-white text-text-grey-shade'}`} key={value} onClick={() => setCriteria((current) => ({ ...current, bedrooms: current.bedrooms === String(value) ? '' : String(value) }))} type="button">{value}</button>)}
        </div>
      </section>
      <section className="mt-search-filter-group">
        <h2 className="mb-2 text-search-filter-heading font-bold text-text-grey-dark">Bathrooms</h2>
        <div className="flex justify-between gap-1">
          {(filters?.bathrooms ?? []).map((value) => <button aria-pressed={criteria.bathrooms === String(value)} className={`size-search-choice rounded-full border border-border-grey-shade text-search-choice ${criteria.bathrooms === String(value) ? 'border-brand-700 bg-brand-50 text-brand-700' : 'bg-white text-text-grey-shade'}`} key={value} onClick={() => setCriteria((current) => ({ ...current, bathrooms: current.bathrooms === String(value) ? '' : String(value) }))} type="button">{value}</button>)}
        </div>
      </section>
      {filters?.priceRange && <RangeFilter label="Price Range" minimum={filters.priceRange.min} maximum={filters.priceRange.max} minValue={criteria.minPrice ?? filters.priceRange.min} maxValue={criteria.maxPrice ?? filters.priceRange.max} onMinimumChange={(minPrice) => setCriteria((current) => ({ ...current, minPrice: Math.min(minPrice, current.maxPrice ?? filters.priceRange.max) }))} onMaximumChange={(maxPrice) => setCriteria((current) => ({ ...current, maxPrice: Math.max(maxPrice, current.minPrice ?? filters.priceRange.min) }))} />}
      {filters?.unitAreaRange && <RangeFilter label="Unit Area" minimum={filters.unitAreaRange.min} maximum={filters.unitAreaRange.max} minValue={criteria.minArea ?? filters.unitAreaRange.min} maxValue={criteria.maxArea ?? filters.unitAreaRange.max} onMinimumChange={(minArea) => setCriteria((current) => ({ ...current, minArea: Math.min(minArea, current.maxArea ?? filters.unitAreaRange.max) }))} onMaximumChange={(maxArea) => setCriteria((current) => ({ ...current, maxArea: Math.max(maxArea, current.minArea ?? filters.unitAreaRange.min) }))} />}
      <div className="mt-search-filter-group flex flex-col gap-search-filter-group">
        {(['finishing', 'amenities'] as const).map(renderGroup)}
      </div>
      <button className="mt-6 h-search-apply w-full rounded-button bg-brand-700 text-label-14 font-medium text-white transition-colors hover:bg-brand-800" onClick={onApply} type="button">Apply</button>
    </aside>
  )
}

function RangeFilter({ label, minimum, maximum, minValue, maxValue, onMinimumChange, onMaximumChange }: { label: string; minimum: number; maximum: number; minValue: number; maxValue: number; onMinimumChange: (value: number) => void; onMaximumChange: (value: number) => void }) {
  return (
    <section className="mt-search-filter-group">
      <h2 className="mb-2 text-search-filter-heading font-bold text-text-grey-dark">{label}</h2>
      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between gap-3 text-search-range text-text-grey-shade"><span>Minimum</span><input aria-label={`Minimum ${label}`} className="search-range min-w-0 flex-1 accent-brand-700" max={maximum} min={minimum} onChange={(event) => onMinimumChange(Number(event.target.value))} type="range" value={minValue} /><span className="min-w-12 text-right">{minValue.toLocaleString('en-US')}</span></label>
        <label className="flex items-center justify-between gap-3 text-search-range text-text-grey-shade"><span>Maximum</span><input aria-label={`Maximum ${label}`} className="search-range min-w-0 flex-1 accent-brand-700" max={maximum} min={minimum} onChange={(event) => onMaximumChange(Number(event.target.value))} type="range" value={maxValue} /><span className="min-w-12 text-right">{maxValue.toLocaleString('en-US')}</span></label>
      </div>
    </section>
  )
}
