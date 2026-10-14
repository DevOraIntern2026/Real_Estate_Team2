import notifi from "../../../../../public/dashboardImgs/notification1.png";

type Stat = { label: string; value: string };

type Listing = {
  id: number;
  title: string;
  owner: string;
  type: string;
  purpose: string;
  area: string;
  price: string;
  submitted: string;
};

type Notification = {
  id: number;
  icon: string;
  title: string;
  text: string;
  time: string;
};

const stats: Stat[] = [
  { label: "Total User", value: "300" },
  { label: "Total Listing", value: "300" },
  { label: "New Users (30d)", value: "300" },
  { label: "Published", value: "300" },
];

const listings: Listing[] = [
  {
    id: 1,
    title: "Modern Luxury Villa with Private Pool",
    owner: "Sara Ahmed",
    type: "Villa",
    purpose: "Rent",
    area: "Riverside",
    price: "75,000EGP",
    submitted: "May 21, 2027",
  },
  {
    id: 2,
    title: "Modern Luxury Villa with Private Pool",
    owner: "Sara Ahmed",
    type: "Villa",
    purpose: "Rent",
    area: "Riverside",
    price: "75,000EGP",
    submitted: "May 21, 2027",
  },
];

const notifications: Notification[] = [
  {
    id: 1,
    icon: "fa-regular fa-circle-check",
    title: "2 new listings require review.",
    text: '"Cozy Studio Near Riverwalk" and "Office Suite in Old Town Business Park", are awaiting review.',
    time: "20 min ago",
  },
  {
    id: 2,
    icon: "fa-regular fa-user",
    title: "New user registration",
    text: "Maya Hollow joined DevOra as a Buyer/Renter.",
    time: "Sep 23, 2027",
  },
  {
    id: 3,
    icon: "fa-regular fa-circle-xmark",
    title: "Listing #DEV-1044 was rejected.",
    text: "Rejected by James Cole — reason: Low quality images.",
    time: "Yesterday",
  },
];

export default function Overview() {
  return (
    <section className="p-8 text-[#241A12]">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b-[0.8px] border-[#87400E] pb-4">
        <div>
          <p className="font-medium">Good morning, Omar</p>
          <p className="text-[#5A4F49]">
            Monitor DevOra's listings, users, inquiries, and platform activity.
          </p>
        </div>
        <div className="flex gap-6">
          <button className="rounded-sm bg-[#87400E] px-6 py-2 font-medium text-[#FAFAFA]">
            Review Pending Listings
          </button>
          <button className="rounded-sm border-[0.8px] border-[#87400E] px-6 py-2 font-medium text-[#87400E]">
            View Reports
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="my-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm border-[0.8px] border-[#87400E] p-3"
          >
            <p className="text-sm text-[#5A4F49]">{stat.label}</p>
            <span className="text-lg font-medium">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Listings Awaiting Review */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium">Listings Awaiting Review</p>
          <a href="#" className="text-sm text-[#87400E] underline">
            View all
          </a>
        </div>

        <div className="flex flex-col gap-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border-[0.8px] border-[#87400E] p-3"
            >
              <div className="flex items-center gap-4">
                <img
                  src={notifi}
                  alt={item.title}
                  className="h-14 w-14 rounded-sm object-cover"
                />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-[#5A4F49]">
                    {item.owner}. {item.type}. {item.purpose}. {item.area}.{" "}
                    {item.price}
                    <br />
                    Submitted {item.submitted}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 rounded-full bg-[#F3E9E0] px-3 py-1 text-xs text-[#5A4F49]">
                  <span className="h-2 w-2 rounded-full bg-[#87400E]" />
                  Under Review
                </span>
                <button
                  aria-label="Approve listing"
                  className="flex h-9 w-9 items-center justify-center rounded-sm border-[0.8px] border-[#87400E] text-[#87400E]"
                >
                  <i className="fa-solid fa-check" />
                </button>
                <button
                  aria-label="Reject listing"
                  className="flex h-9 w-9 items-center justify-center rounded-sm border-[0.8px] border-[#87400E] text-[#87400E]"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
                <button className="rounded-sm bg-[#87400E] px-6 py-2 font-medium text-[#FAFAFA]">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notification */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium">Recent Notification</p>
          <a href="#" className="text-sm text-[#87400E] underline">
            View all
          </a>
        </div>

        <div className="flex flex-col gap-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-4 rounded-sm border-[0.8px] border-[#87400E] p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[0.8px] border-[#87400E] text-[#87400E]">
                <i className={n.icon} />
              </span>
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-[#5A4F49]">{n.text}</p>
                <p className="mt-1 text-xs text-[#5A4F49]">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
