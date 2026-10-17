import { model, models, Schema, Types } from "mongoose";

export interface IReview {
  property: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxLength: 1000 },
  },
  { timestamps: true, collection: "Reviews" },
);

export const reviewModel =
  models.Review || model<IReview>("Review", reviewSchema);