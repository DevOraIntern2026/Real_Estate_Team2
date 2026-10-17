import { useState } from 'react'
import type { Review } from '../types/types'
import { timeAgo } from '../utils/utils'
import StarRating from './StarRating'

const INITIAL_COUNT = 3

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_COUNT)

  return (
    <section className="rounded-outer border-border-grey-shade bg-main-white border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title-24 font-semibold text-[#0f0f3d]">
          Reviews ({reviews.length})
        </h2>
        {reviews.length > INITIAL_COUNT && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-text-accent text-title-22 font-medium"
          >
            {expanded ? 'See Less' : 'See More'}
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-label-14 text-text-grey-shade mt-4">
          No reviews yet.
        </p>
      ) : (
        <ul className="mt-4">
          {visible.map((r) => (
            <li
              key={r._id}
              className="border-border-grey-light flex items-start gap-4 border-b py-4 last:border-b-0"
            >
              <img
                src={r.avatar}
                alt=""
                className="size-16 shrink-0 rounded-full object-cover"
              />
              <div className="max-w-full flex-col gap-3">
                <div className="mb-2 flex flex-col gap-2">
                  <p className="text-title-18 font-medium">{r.author}</p>
                  <StarRating value={r.rating} />
                </div>
                <p className="text-label-14 text-text-grey-shade min-w-36">
                  {r.comment}
                </p>
                <p className="text-caption-12 text-text-grey-light mt-1">
                  {timeAgo(r.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
