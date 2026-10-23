import clsx from 'clsx'
import { ListFilter, MapPin, MessageCircle, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { useProfileStore } from '../hooks/useprofile'
import type {
  Inquiry,
  InquiryFilter,
  InquirySort,
} from '../schema/inquiry.schema'
import propertyFallback from '@/assets/images/property-available.png'

const tabs: { value: InquiryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
]
const sorts: { value: InquirySort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_high', label: 'Price: high to low' },
  { value: 'price_low', label: 'Price: low to high' },
]

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
}
const fmtPrice = (i: Inquiry) =>
  `${i.property.currency} ${i.property.price.toLocaleString('en-US')}`

export default function MyInquiriesPage() {
  const {
    inquiries,
    total,
    query,
    inquiriesLoading,
    inquiriesError,
    setQuery,
    fetchInquiries,
  } = useProfileStore()
  const [search, setSearch] = useState(query.search)

  // Re-fetch whenever the query changes
  useEffect(() => {
    void fetchInquiries()
  }, [query, fetchInquiries])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== query.search) setQuery({ search })
    }, 350)
    return () => clearTimeout(t)
  }, [search, query.search, setQuery])

  return (
    <section className="rounded-outer bg-main-white p-8">
      <div className="flex flex-wrap gap-3">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setQuery({ status: t.value })}
            className={clsx(
              'rounded-button text-title-18 h-12 border px-8',
              query.status === t.value
                ? 'bg-main-primary text-main-white border-main-primary'
                : 'border-border-grey-shade text-text-grey-dark',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-bg-surface-variant mt-6 flex flex-col gap-2 rounded-full p-2 sm:flex-row">
        <label className="rounded-button bg-main-white border-border-grey-shade flex h-12 flex-1 items-center gap-3 border px-5">
          <Search className="text-icon-grey-light h-6 w-6" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by property name or owner..."
            className="textfield__input"
          />
        </label>
        <label className="rounded-button bg-main-white border-border-grey-shade flex h-12 items-center gap-3 border px-5">
          <select
            value={query.sort}
            onChange={(e) => setQuery({ sort: e.target.value as InquirySort })}
            className="text-text-grey-shade appearance-none bg-transparent outline-none"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ListFilter className="text-icon-grey-shade h-5 w-5" />
        </label>
      </div>

      {inquiriesError && (
        <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-inner border border-error-light bg-error-lighter px-5 py-4 text-label-14 text-error-darker">
          <span>{inquiriesError}</span>
          <button type="button" onClick={() => void fetchInquiries()} className="font-medium underline">Try again</button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-205 text-left">
          <thead>
            <tr className="bg-bg-surface-variant text-text-grey-shade text-label-14 uppercase">
              {['Property', 'Owner', 'Date', 'Status', 'Message'].map((h) => (
                <th key={h} className="px-6 py-4 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={clsx(inquiriesLoading && 'opacity-50')}>
            {inquiries.map((i) => {
              const { day, time } = fmtDate(i.createdAt)
              return (
                <tr
                  key={i._id}
                  className="border-border-grey-shade border-b last:border-0"
                >
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-4">
                        <img
                        src={i.property.images[0] || propertyFallback}
                        alt=""
                        className="h-16 w-20 rounded-lg object-cover"
                      />
                      <div>
                        <Link
                          to={`/property-details/${i.property._id}`}
                          className="text-title-18 font-medium text-[#0f1a3a]"
                        >
                          {i.property.title}
                        </Link>
                        <p className="text-label-14 text-text-grey-shade flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {i.property.location.city},{' '}
                          {i.property.location.country}
                        </p>
                        <p className="text-attention-darker font-medium">
                          {fmtPrice(i)}
                          {i.property.transactionType === 'rent' && (
                            <span className="text-label-14 text-text-grey-shade">
                              /mo
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {i.owner.avatar ? <img src={i.owner.avatar} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-caption-12 font-semibold text-brand-700">{i.owner.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>}
                      <div>
                        <p className="font-medium">{i.owner.name}</p>
                        <p className="text-label-14 text-text-grey-shade">
                          {i.owner.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p>{day}</p>
                    <p className="text-label-14 text-text-grey-shade">{time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/customer/messages/${i._id}`}
                      className="flex items-center gap-2"
                    >
                      Message <MessageCircle className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!inquiriesLoading && !inquiriesError && inquiries.length === 0 && (
          <p className="text-text-grey-shade py-16 text-center">
            No inquiries match your filters. Clear the search or pick another
            status.
          </p>
        )}
      </div>

      <Pagination
        page={query.page}
        total={total}
        limit={query.limit}
        onChange={(page) => setQuery({ page })}
      />
    </section>
  )
}
