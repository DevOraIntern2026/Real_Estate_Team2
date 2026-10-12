import { HydratedDocument, model, models, Schema } from "mongoose";
import { ICategory } from "../../common/interfaces";

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, maxLength: 50, trim: true },
    slug: { type: String, unique: true, maxLength: 60 },
    description: { type: String, maxLength: 300 },
    icon: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    paranoid: { type: Boolean, default: false },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "Categories",
  },
);

categorySchema.index({ name: "text", description: "text" });

categorySchema.pre(
  "save",
  async function (this: HydratedDocument<ICategory>) {
    if (this.isModified("name") || !this.slug) {
      this.slug = this.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
  },
);

//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Query middlewares (soft delete)
//////////////////////// Find
categorySchema.pre(["findOne", "find"], function () {
  const query = this.getFilter();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
    return;
  }
  this.setQuery({ ...query, deletedAt: { $exists: false } });
});
//////////////////////// Update
categorySchema.pre(["updateOne", "findOneAndUpdate"], function () {
  const updateQuery = this.getUpdate() as HydratedDocument<ICategory>;
  if (updateQuery?.deletedAt) {
    this.setUpdate({ ...updateQuery, $unset: { restoredAt: 1 } });
  }
  if (updateQuery?.restoredAt) {
    this.setUpdate({ ...updateQuery, $unset: { deletedAt: 1 } });
    this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
  }
  const query = this.getFilter();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ deletedAt: { $exists: false }, ...query });
  }
});
//////////////////////// Delete
categorySchema.pre(["deleteOne", "findOneAndDelete"], function () {
  const query = this.getFilter();
  if (query.force) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ deletedAt: { $exists: true }, ...query });
  }
});

export const categoryModel =
  models.Category || model<ICategory>("Category", categorySchema);
