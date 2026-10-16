import { model, models, Schema } from "mongoose";
import { IListingStatusHistory } from "../../common/interfaces";

const listingStatusHistorySchema = new Schema<IListingStatusHistory>(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String },
    feedback: { type: String },
  },
  {
    timestamps: true,
    strict: true,
    collection: "ListingStatusHistories",
  },
);

listingStatusHistorySchema.index({ listing: 1, createdAt: -1 });

export const listingStatusHistoryModel =
  models.ListingStatusHistory ||
  model<IListingStatusHistory>(
    "ListingStatusHistory",
    listingStatusHistorySchema,
  );
