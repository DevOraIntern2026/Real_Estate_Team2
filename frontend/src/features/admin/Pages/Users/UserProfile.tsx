import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import PageHeader from "../../components/shared/PageHeader";
import SearchInput from "../../components/shared/SearchInput";
import { getPropertiesByOwner } from "../../data/properties.mock";
import ListingsSummaryCard from "./components/ListingsSummaryCard";
import ProfileCard from "./components/ProfileCard";
import UserListings from "./components/UserListings";
import UserSummary from "./components/UserSummary";
import { STATUS_ACTIONS, TEXT } from "./constants";
import { getListingsSummary } from "./listingsSummary";
import { USERS_PATH } from "./paths";
import { useUsers } from "./UsersContext";

export default function UserProfile() {
  const { userId = "" } = useParams<{ userId: string }>();
  const { getUserById, setUserStatus } = useUsers();
  const user = getUserById(userId);

  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const allListings = useMemo(() => getPropertiesByOwner(userId), [userId]);
  const summary = useMemo(() => getListingsSummary(allListings), [allListings]);

  // the header search filters THIS user's listings
  const visibleListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allListings;
    return allListings.filter((p) =>
      [p.title, p.owner, p.location, p.city, p.code].some((f) =>
        f.toLowerCase().includes(q)
      )
    );
  }, [allListings, search]);

  if (!user) {
    return (
      <section className="p-8">
        <PageHeader title={TEXT.title} subtitle={TEXT.subtitle} />
        <p className="py-10 text-center text-sm text-[#5A4F49]">
          {TEXT.notFound}{" "}
          <Link to={USERS_PATH} className="text-[#87400E] underline">
            Back to users
          </Link>
        </p>
      </section>
    );
  }

  const action = STATUS_ACTIONS[user.status];

  const handleConfirm = () => {
    setUserStatus(user.id, action.nextStatus);
    setConfirmOpen(false);
  };

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.title} subtitle={TEXT.subtitle}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={TEXT.listingSearchPlaceholder}
          className="w-full min-w-[240px] md:w-72"
        />
      </PageHeader>

      <UserSummary user={user} onAction={() => setConfirmOpen(true)} />

      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <ProfileCard user={user} />
        <ListingsSummaryCard summary={summary} />
      </div>

      <UserListings
        listings={visibleListings}
        emptyMessage={
          allListings.length === 0 ? TEXT.noUserListings : TEXT.noListingMatch
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        title={action.dialogTitle}
        message={action.dialogMessage}
        confirmLabel={action.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
