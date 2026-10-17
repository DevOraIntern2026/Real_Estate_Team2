import searchIcon from '@/assets/images/search.svg'
import chevronDownIcon from '@/assets/images/chevron-down-landing.svg'
import type { LandingPageData } from '@/features/landing/types/landingPage'

export function PropertySearch({ filters }: { filters?: LandingPageData['filters'] }) {
  const dropdowns = [
    { label: 'Property Type', options: filters?.propertyTypes.map(({ value, label }) => ({ value, label })) ?? [] },
    { label: 'Transaction Type', options: filters?.transactionTypes.map(({ value, label }) => ({ value, label })) ?? [] },
    { label: 'Bedrooms', options: filters?.bedrooms.map((value) => ({ value, label: String(value) })) ?? [] },
  ]

  return (
    <section aria-label="Search properties" className="relative z-2 mx-auto -mt-landing-search-overlap w-full max-w-landing-search-panel rounded-inner bg-bg-white p-6 shadow-2 max-landing-mobile:p-4" id="search">
      <label className="flex h-landing-search-field items-center gap-3 rounded-inner border border-border-grey-shade px-5 text-icon-grey-light">
        <img alt="" src={searchIcon} />
        <input className="min-w-0 flex-1 bg-transparent text-body-sm text-text-grey-dark outline-none placeholder:text-text-grey-light" placeholder="Search by Area or Location" />
      </label>
      <div className="mt-6 grid grid-cols-landing-search gap-landing-search-gap max-landing-tablet:grid-cols-2 max-landing-mobile:grid-cols-1">
        {dropdowns.map(({ label, options }) => (
          <label className="relative flex h-landing-search-field w-landing-search-dropdown items-center rounded-inner border border-border-grey-shade px-5 text-body-sm text-text-grey-light max-landing-tablet:w-full" key={label}>
            <select aria-label={label} className="size-full appearance-none bg-transparent pr-6 outline-none" defaultValue="">
              <option value="" disabled>{label}</option>
              {options.map(({ value, label: optionLabel }) => <option key={value} value={value}>{optionLabel}</option>)}
            </select>
            <img alt="" className="pointer-events-none absolute right-5" src={chevronDownIcon} />
          </label>
        ))}
        <button className="flex h-landing-search-field w-landing-search-button items-center justify-center gap-2 rounded-inner bg-brand-700 px-6 text-body-sm font-medium text-white transition-colors hover:bg-brand-800 max-landing-tablet:w-full" type="button">
          <img alt="" src={searchIcon} /> Search
        </button>
      </div>
    </section>
  )
}
