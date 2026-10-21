import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CustomerHeader } from '@/features/customer/components/CustomerHeader'
import { LandingFooter, LandingHeader } from '@/features/landing/components'
import { getAuthSession } from '@/services/api/tokenStorage'
import { SearchIcon, SortIcon } from '@/features/search/components/SearchIcons'
import { SearchFilters } from '@/features/search/components/SearchFilters'
import { initialSearchCriteria, type SearchCriteria } from '@/features/search/types/search'
import { SearchPropertyCard } from '@/features/search/components/SearchPropertyCard'
import { useSearchProperties } from '@/features/search/hooks/useSearchProperties'
import type { SearchQuery } from '@/features/search/types/search'

const sortOptions: { label: string; value: NonNullable<SearchQuery['sort']> }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Lowest to highest price', value: 'price_asc' },
  { label: 'Highest to lowest price', value: 'price_desc' },
]

function getCriteriaFromUrl(params: URLSearchParams): SearchCriteria {
  return {
    ...initialSearchCriteria,
    lookingFor: params.get('transactionType')?.split(',') ?? [],
    areas: params.get('area')?.split(',') ?? [],
    propertyTypes: params.get('propertyType')?.split(',') ?? [],
    bedrooms: params.get('bedrooms') ?? '',
    bathrooms: params.get('bathrooms') ?? '',
    minPrice: undefined,
    maxPrice: undefined,
    minArea: undefined,
    maxArea: undefined,
  }
}

function toSearchQuery(criteria: SearchCriteria): Omit<SearchQuery, 'search' | 'sort' | 'page' | 'limit'> {
  return {
    transactionType: criteria.lookingFor.join(',') || undefined,
    area: criteria.areas.join(',') || undefined,
    propertyType: criteria.propertyTypes.join(',') || undefined,
    bedrooms: criteria.bedrooms || undefined,
    bathrooms: criteria.bathrooms || undefined,
    minPrice: criteria.minPrice,
    maxPrice: criteria.maxPrice,
    minArea: criteria.minArea,
    maxArea: criteria.maxArea,
    furnishing: criteria.finishing.join(',') || undefined,
    amenities: criteria.amenities.join(',') || undefined,
  }
}

export default function SearchPage({ authenticated }: { authenticated: boolean }) {
  const showCustomerChrome = authenticated || getAuthSession()?.role === 'customer'
  const [urlParams, setUrlParams] = useSearchParams()
  const [search, setSearch] = useState(() => urlParams.get('search') ?? '')
  const [sort, setSort] = useState<NonNullable<SearchQuery['sort']>>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [criteria, setCriteria] = useState<SearchCriteria>(() => getCriteriaFromUrl(urlParams))
  const [appliedCriteria, setAppliedCriteria] = useState<SearchCriteria>(() => getCriteriaFromUrl(urlParams))
  const [page, setPage] = useState(1)
  const query: SearchQuery = {
    ...toSearchQuery(appliedCriteria),
    search: search || undefined,
    sort,
    page,
    limit: 10,
  }
  const { data, isPending, isFetching, isError, error } = useSearchProperties(query)
  const properties = data?.properties ?? []
  const pagination = data?.pagination

  const applyFilters = () => {
    setAppliedCriteria(criteria)
    setPage(1)
    setMobileFiltersOpen(false)
  }

  const resetFilters = () => {
    setCriteria(initialSearchCriteria)
    setAppliedCriteria(initialSearchCriteria)
    setSearch('')
    setPage(1)
    setUrlParams({})
  }

  const updateSearch = (value: string) => {
    setSearch(value)
    setPage(1)
    const params = new URLSearchParams(urlParams)
    if (value) params.set('search', value)
    else params.delete('search')
    setUrlParams(params, { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {showCustomerChrome ? <CustomerHeader activePage="Search" /> : <LandingHeader activePage="Search" />}
      <main className="mx-auto w-full max-w-search-page px-search-page-x pb-search-page-bottom pt-search-page-top max-search-mobile:px-search-page-mobile-x">
        <nav aria-label="Breadcrumb" className="mb-search-breadcrumb flex items-center gap-3 text-search-breadcrumb">
          <Link className="text-text-grey-light transition-colors hover:text-brand-700" to={showCustomerChrome ? '/customer-home' : '/'}>Home</Link>
          <span className="text-text-grey-light">›</span>
          <span aria-current="page" className="font-medium text-brand-700">Search</span>
        </nav>

        <div className="mb-search-content flex gap-search-sort max-search-mobile:flex-wrap">
          <label className="flex h-search-control min-w-0 flex-1 items-center gap-3 rounded-search-input border border-border-grey-shade bg-white px-4 text-icon-grey-light">
            <SearchIcon className="size-search-input-icon shrink-0" />
            <input className="min-w-0 flex-1 bg-transparent text-search-input text-text-grey-dark outline-none placeholder:text-text-grey-light" onChange={(event) => updateSearch(event.target.value)} placeholder="Search by Area or Location" value={search} />
          </label>
          <div className="relative shrink-0">
            <button aria-expanded={sortOpen} className="flex h-search-control w-search-sort items-center justify-between gap-3 rounded-search-input border border-border-grey-shade bg-white px-4 text-search-input text-text-grey-light" onClick={() => setSortOpen((open) => !open)} type="button">
              <span>Sort by</span><SortIcon className="size-search-sort-icon text-text-grey-shade" />
            </button>
            {sortOpen && <div className="absolute right-0 top-full z-20 mt-2 w-search-sort-menu overflow-hidden rounded-search-panel border border-border-grey-light bg-white py-1 shadow-2" role="listbox" aria-label="Sort properties">
              {sortOptions.map((option) => <button aria-selected={sort === option.value} className={`flex w-full items-center gap-3 px-4 py-3 text-left text-search-sort-option ${sort === option.value ? 'bg-brand-50' : 'bg-white hover:bg-bg-light'}`} key={option.value} onClick={() => { setSort(option.value); setSortOpen(false); setPage(1) }} role="option" type="button"><span className={`size-search-radio rounded-full border ${sort === option.value ? 'border-brand-400 bg-brand-400 ring-2 ring-inset ring-white' : 'border-border-grey-shade'}`} />{option.label}</button>)}
            </div>}
          </div>
          <button className="h-search-control rounded-search-input border border-border-grey-shade bg-white px-4 text-search-input text-brand-700 lg:hidden" onClick={() => setMobileFiltersOpen(true)} type="button">Filters</button>
        </div>

        <div className="grid grid-cols-search-layout items-start gap-search-layout max-search-tablet:grid-cols-1">
          <div className="hidden lg:block">
            <SearchFilters criteria={criteria} filters={data?.filters} onApply={applyFilters} setCriteria={setCriteria} />
          </div>
          <section aria-label="Search results" className="min-w-0">
            <div aria-live="polite" className="sr-only">{pagination?.total ?? 0} properties found</div>
            {isPending ? <div className="rounded-search-panel bg-white p-8 text-center text-text-grey-shade">Loading properties…</div>
              : isError ? <div className="rounded-search-panel border border-border-grey-shade bg-white p-8 text-center text-text-grey-shade">{error instanceof Error ? error.message : 'Could not load properties. Please try again.'}</div>
              : properties.length > 0 ? <>
                <div className="mb-4 flex items-center justify-between text-search-input text-text-grey-shade">
                  <span>{pagination?.total ?? properties.length} properties found</span>
                  {isFetching && <span className="text-caption-12">Updating results…</span>}
                </div>
                <div className="grid grid-cols-2 gap-search-card max-search-mobile:grid-cols-1">
                  {properties.map((property) => <SearchPropertyCard key={property._id} property={property} propertyTypes={data?.filters.propertyTypes} transactionTypes={data?.filters.lookingFor} />)}
                </div>
                {pagination && pagination.pages > 1 && <nav aria-label="Search result pages" className="mt-8 flex items-center justify-center gap-4">
                  <button className="rounded-button border border-border-grey-shade bg-white px-4 py-2 text-label-14 text-brand-700 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} type="button">Previous</button>
                  <span className="text-label-14 text-text-grey-shade">Page {pagination.page} of {pagination.pages}</span>
                  <button className="rounded-button border border-border-grey-shade bg-white px-4 py-2 text-label-14 text-brand-700 disabled:opacity-40" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)} type="button">Next</button>
                </nav>}
              </> : <div className="rounded-search-panel border border-border-grey-shade bg-white p-8 text-center text-text-grey-shade">No properties match these filters. <button className="ml-1 font-medium text-brand-700 underline" onClick={resetFilters} type="button">Clear filters</button></div>}
          </section>
        </div>
      </main>

      {mobileFiltersOpen && <div className="fixed inset-0 z-50 flex items-end bg-overlay/40 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
        <div aria-label="Property filters" aria-modal="true" className="max-h-search-mobile-drawer w-full overflow-y-auto rounded-t-search-panel bg-bg-light p-4" onClick={(event) => event.stopPropagation()} role="dialog">
          <div className="mb-3 flex items-center justify-between"><span className="text-title-18 font-bold">Filters</span><button aria-label="Close filters" className="size-10 rounded-full bg-white text-title-24" onClick={() => setMobileFiltersOpen(false)} type="button">×</button></div>
          <SearchFilters criteria={criteria} filters={data?.filters} onApply={applyFilters} setCriteria={setCriteria} />
        </div>
      </div>}
      <LandingFooter />
    </div>
  )
}
