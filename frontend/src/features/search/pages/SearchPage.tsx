import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CustomerHeader } from '@/features/customer/components/CustomerHeader'
import { LandingHeader } from '@/features/landing/components/LandingHeader'
import { SearchIcon, SortIcon } from '@/features/search/components/SearchIcons'
import { SearchFilters, initialSearchCriteria, type SearchCriteria } from '@/features/search/components/SearchFilters'
import { SearchPropertyCard } from '@/features/search/components/SearchPropertyCard'
import { searchProperties } from '@/features/search/data/searchProperties'

const sortOptions = ['Lowest to highest Price', 'Highest to Lowest Price', 'Newest', 'Minimum Installment', 'Maximum Installment']

export default function SearchPage({ authenticated }: { authenticated: boolean }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(sortOptions[1])
  const [sortOpen, setSortOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [criteria, setCriteria] = useState<SearchCriteria>(initialSearchCriteria)
  const [filtersApplied, setFiltersApplied] = useState(false)

  const properties = useMemo(() => {
    const filtered = searchProperties.filter((property) => {
      const matchesQuery = `${property.title} ${property.location} ${property.type}`.toLowerCase().includes(search.toLowerCase())
      const matchesArea = !filtersApplied || criteria.areas.length === 0 || criteria.areas.includes(property.areaName)
      const matchesType = !filtersApplied || criteria.propertyTypes.length === 0 || criteria.propertyTypes.includes(property.type)
      const matchesBedrooms = !filtersApplied || !criteria.bedrooms || property.beds >= Number(criteria.bedrooms.replace('+', ''))
      const matchesBathrooms = !filtersApplied || !criteria.bathrooms || property.baths >= Number(criteria.bathrooms)
      const matchesPrice = !filtersApplied || property.price <= criteria.price
      const matchesUnitArea = !filtersApplied || property.area <= criteria.unitArea
      return matchesQuery && matchesArea && matchesType && matchesBedrooms && matchesBathrooms && matchesPrice && matchesUnitArea
    })
    if (sort === sortOptions[0]) return filtered.sort((a, b) => a.price - b.price)
    if (sort === sortOptions[1]) return filtered.sort((a, b) => b.price - a.price)
    return filtered
  }, [criteria, filtersApplied, search, sort])

  const resetFilters = () => { setCriteria({ ...initialSearchCriteria, lookingFor: [], areas: [], propertyTypes: [], finishing: [], amenities: [] }); setFiltersApplied(true) }

  return (
    <div className="min-h-screen bg-bg-light">
      {authenticated ? <CustomerHeader activePage="Search" /> : <LandingHeader activePage="Search" />}
      <main className="mx-auto w-full max-w-search-page px-search-page-x pb-search-page-bottom pt-search-page-top max-search-mobile:px-search-page-mobile-x">
        <nav aria-label="Breadcrumb" className="mb-search-breadcrumb flex items-center gap-3 text-search-breadcrumb">
          <Link className="text-text-grey-light transition-colors hover:text-brand-700" to={authenticated ? '/customer-home' : '/'}>Home</Link>
          <span className="text-text-grey-light">›</span>
          <span aria-current="page" className="font-medium text-brand-700">Search</span>
        </nav>

        <div className="mb-search-content flex gap-search-sort">
          <label className="flex h-search-control min-w-0 flex-1 items-center gap-3 rounded-search-input border border-border-grey-shade bg-white px-4 text-icon-grey-light">
            <SearchIcon className="size-search-input-icon shrink-0" />
            <input className="min-w-0 flex-1 bg-transparent text-search-input text-text-grey-dark outline-none placeholder:text-text-grey-light" onChange={(event) => setSearch(event.target.value)} placeholder="Search by Area or Location" value={search} />
          </label>
          <div className="relative shrink-0">
            <button aria-expanded={sortOpen} className="flex h-search-control w-search-sort items-center justify-between gap-3 rounded-search-input border border-border-grey-shade bg-white px-4 text-search-input text-text-grey-light" onClick={() => setSortOpen((open) => !open)} type="button">
              <span>Sort by</span><SortIcon className="size-search-sort-icon text-text-grey-shade" />
            </button>
            {sortOpen && <div className="absolute right-0 top-full z-20 mt-2 w-search-sort-menu overflow-hidden rounded-search-panel border border-border-grey-light bg-white py-1 shadow-2" role="listbox" aria-label="Sort properties">
              {sortOptions.map((option) => <button aria-selected={sort === option} className={`flex w-full items-center gap-3 px-4 py-3 text-left text-search-sort-option ${sort === option ? 'bg-brand-50' : 'bg-white hover:bg-bg-light'}`} key={option} onClick={() => { setSort(option); setSortOpen(false) }} role="option" type="button"><span className={`size-search-radio rounded-full border ${sort === option ? 'border-brand-400 bg-brand-400 ring-2 ring-inset ring-white' : 'border-border-grey-shade'}`} />{option}</button>)}
            </div>}
          </div>
          <button className="h-search-control rounded-search-input border border-border-grey-shade bg-white px-4 text-search-input text-brand-700 lg:hidden" onClick={() => setMobileFiltersOpen(true)} type="button">Filters</button>
        </div>

        <div className="grid grid-cols-search-layout items-start gap-search-layout max-search-tablet:grid-cols-1">
          <div className="hidden lg:block">
            <SearchFilters criteria={criteria} onApply={() => setFiltersApplied(true)} setCriteria={setCriteria} />
          </div>
          <section aria-label="Search results" className="min-w-0">
            <div aria-live="polite" className="sr-only">{properties.length} properties found</div>
            {properties.length > 0 ? <div className="grid grid-cols-2 gap-search-card max-search-mobile:grid-cols-1">
              {properties.map((property) => <SearchPropertyCard key={property.id} property={property} />)}
            </div> : <div className="rounded-search-panel border border-border-grey-shade bg-white p-8 text-center text-text-grey-shade">No properties match these filters. <button className="ml-1 font-medium text-brand-700 underline" onClick={() => { resetFilters(); setSearch('') }} type="button">Clear filters</button></div>}
          </section>
        </div>
      </main>

      {mobileFiltersOpen && <div className="fixed inset-0 z-50 flex items-end bg-overlay/40 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
        <div aria-label="Property filters" aria-modal="true" className="max-h-search-mobile-drawer w-full overflow-y-auto rounded-t-search-panel bg-bg-light p-4" onClick={(event) => event.stopPropagation()} role="dialog">
          <div className="mb-3 flex items-center justify-between"><span className="text-title-18 font-bold">Filters</span><button aria-label="Close filters" className="size-10 rounded-full bg-white text-title-24" onClick={() => setMobileFiltersOpen(false)} type="button">×</button></div>
          <SearchFilters criteria={criteria} onApply={() => { setFiltersApplied(true); setMobileFiltersOpen(false) }} setCriteria={setCriteria} />
        </div>
      </div>}
    </div>
  )
}
