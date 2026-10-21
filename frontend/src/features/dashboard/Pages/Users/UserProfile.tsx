import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage, isApiError } from "../../api";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import ErrorState from "../../components/shared/ErrorState";
import LoadingState from "../../components/shared/LoadingState";
import PageHeader from "../../components/shared/PageHeader";
import { listingDetailsPath } from "../../constants/paths";
import ListingsSummaryCard from "./components/ListingsSummaryCard";
import ProfileCard from "./components/ProfileCard";
import UserListings from "./components/UserListings";
import UserSummary from "./components/UserSummary";
import { STATUS_ACTIONS, TEXT } from "./constants";
import { USERS_PATH } from "./paths";
import { useAdminUser, useChangeUserStatus, useUserListings } from "./queries";

export default function UserProfile() {
  const { userId = "" } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const profile = useAdminUser(userId);
  const [page, setPage] = useState(1);
  const listings = useUserListings(userId, page, profile.data?.user.name);
  const change = useChangeUserStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const header = <PageHeader title={TEXT.title} subtitle={TEXT.subtitle} />;

  if (profile.isPending) {
    return (
      <section className="p-8">
        {header}
        <LoadingState rows={4} />
      </section>
    );
  }

  if (profile.isError) {
    const notFound = isApiError(profile.error) && profile.error.status === 404;
    return (
      <section className="p-8">
        {header}
        {notFound ? (
          <p className="py-10 text-center text-sm text-[#5A4F49]">
            {TEXT.notFound}{" "}
            <Link to={USERS_PATH} className="text-[#87400E] underline">
              Back to users
            </Link>
          </p>
        ) : (
          <ErrorState
            message={getErrorMessage(profile.error)}
            onRetry={() => void profile.refetch()}
            isRetrying={profile.isRefetching}
          />
        )}
      </section>
    );
  }

  const { user, summary } = profile.data;
  const action = STATUS_ACTIONS[user.status]; // undefined for a status we don't know

  const closeDialog = () => {
    if (change.isPending) return; // don't dismiss while the request runs
    setConfirmOpen(false);
    change.reset();
  };

  const confirm = () => {
    if (!action) return;
    change.mutate(
      { id: user.id, to: action.nextStatus },
      { onSuccess: () => setConfirmOpen(false) } // the lists refresh by themselves (invalidate)
    );
  };

  return (
    <section className="p-8 text-[#241A12]">
      {header}

      <UserSummary user={user} onAction={() => setConfirmOpen(true)} />

      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <ProfileCard user={user} />
        <ListingsSummaryCard summary={summary} />
      </div>

      <UserListings
        rows={listings.data?.items ?? []}
        isLoading={listings.isPending}
        isRefreshing={listings.isPlaceholderData}
        error={listings.error}
        onRetry={() => void listings.refetch()}
        page={page}
        totalPages={listings.data?.totalPages ?? 1}
        onPageChange={setPage}
        onSelect={(row) => navigate(listingDetailsPath(row.id))}
      />

      {action && (
        <ConfirmDialog
          open={confirmOpen}
          title={action.dialogTitle}
          message={
            <>
              {action.dialogMessage}
              {change.isError && (
                <span role="alert" className="mt-2 block text-red-500">
                  {getErrorMessage(change.error)}
                </span>
              )}
            </>
          }
          confirmLabel={action.confirmLabel}
          isLoading={change.isPending}
          onConfirm={confirm}
          onCancel={closeDialog}
        />
      )}
    </section>
  );
}
