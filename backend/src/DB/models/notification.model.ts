import { model, models, Schema } from "mongoose";
import { INotification } from "../../common/interfaces";

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "listing_submitted",
        "listing_rejected",
        "listing_approved",
        "user_registered",
        "system",
        "property_under_review",
        "property_approved",
        "property_rejected",
        "new_inquiry",
        "property_updated",
      ],
      required: true,
    },
    title: { type: String, required: true, maxLength: 200 },
    body: { type: String, required: true, maxLength: 1000 },
    isRead: { type: Boolean, default: false },
    target: {
      kind: { type: String, enum: ["listing", "property", "inquiry", "user", "report"] },
      id: { type: String },
    },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "Notifications",
  },
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

notificationSchema.pre(["findOne", "find"], function () {
  const query = this.getFilter();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
    return;
  }
  this.setQuery({ ...query, deletedAt: { $exists: false } });
});

export const notificationModel =
  models.Notification || model<INotification>("Notification", notificationSchema);
