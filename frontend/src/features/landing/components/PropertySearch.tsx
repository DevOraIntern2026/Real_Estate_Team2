import searchIcon from '@/assets/images/search.svg'
import chevronDownIcon from '@/assets/images/chevron-down-landing.svg'

export function PropertySearch() {
  return (
    <section aria-label="Search properties" className="relative z-2 mx-auto -mt-landing-search-overlap w-full max-w-landing-search-panel rounded-inner bg-bg-white p-6 shadow-2 max-landing-mobile:p-4" id="search">
      <div aria-label="Listing type" className="grid grid-cols-2 border-b border-border-primary">
        <button className="border-b-3 border-brand-700 px-4 py-4 text-label-14 font-medium text-text-grey-dark" type="button">Buy</button>
        <button className="px-4 py-4 text-label-14 font-medium text-text-grey-light" type="button">Rent</button>
      </div>
      <label className="mt-6 flex h-landing-search-field items-center gap-3 rounded-inner border border-border-grey-shade px-5 text-icon-grey-light">
        <img alt="" src={searchIcon} />
        <input className="min-w-0 flex-1 bg-transparent text-body-sm text-text-grey-dark outline-none placeholder:text-text-grey-light" placeholder="Search by Area or Location" />
      </label>
      <div className="mt-6 grid grid-cols-landing-search gap-landing-search-gap max-landing-tablet:grid-cols-2 max-landing-mobile:grid-cols-1">
        {['Property Types', 'Beds and Baths', 'Price Range'].map((label) => (
          <button className="flex h-landing-search-field w-landing-search-dropdown items-center justify-between gap-3 rounded-inner border border-border-grey-shade px-5 text-left text-body-sm text-text-grey-light max-landing-tablet:w-full" key={label} type="button">
            {label}<img alt="" src={chevronDownIcon} />
          </button>
        ))}
        <button className="flex h-landing-search-field w-landing-search-button items-center justify-center gap-2 rounded-inner bg-brand-700 px-6 text-body-sm font-medium text-white transition-colors hover:bg-brand-800 max-landing-tablet:w-full" type="button">
          <img alt="" src={searchIcon} /> Search
        </button>
      </div>
    </section>
  )
}
