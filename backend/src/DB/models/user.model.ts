import { HydratedDocument, model, models, Schema } from "mongoose";
import { IUser } from "../../common/interfaces";
import { GenderEnum, RoleEnum } from "../../common/enums";
import { encrypt, generateHash } from "../../common/utils/security";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, maxLength: 20 },
    lastName: { type: String, required: true, maxLength: 20 },
    email: { type: String, unique: true, required: true, maxLength: 60 },
    password: { type: String, required: true, maxLength: 150 },
    phone: { type: String, maxLength: 20 },
    bio: { type: String, maxLength: 200 },
    profileImage: { type: String },
    coverImages: { type: [String] },
    confirmedAt: { type: Date },
    paranoid: { type: Boolean, default: false },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
    role: {
      type: Number,
      enum: RoleEnum,
      default: RoleEnum.CUSTOMER,
    },
    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.MALE,
    },
    provider: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "Users",
    virtuals: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

//////////////important! any virtual fields run before mongoose middlewares and schema
userSchema
  .virtual("username")
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (this: IUser, value: string) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName as string;
    this.lastName = lastName as string;
  });

userSchema.pre(
  "save",
  async function (this: HydratedDocument<IUser> & { wasNew: boolean }) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
      this.password = await generateHash(this.password as string);
    }

    if (this.phone && this.isModified("phone")) {
      this.phone = await encrypt(this.phone);
    }
  },
);

////////////////////////////// updateOne hook
userSchema.pre("updateOne", { document: true }, function () {});
////////////////////////////// deleteOne hook
userSchema.pre("deleteOne", { document: true }, function () {});
////////////////////////////// insertMany hook

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Query middlewares

//////////////////////// Find
userSchema.pre(["findOne", "find"], function () {
  const query = this.getFilter();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  }
  this.setQuery({ ...query, deletedAt: { $exists: false } });
});
//////////////////////// Update
userSchema.pre(["updateOne", "findOneAndUpdate"], function () {
  //////// to check search query or filter

  const updateQuery = this.getUpdate() as HydratedDocument<IUser>;
  if (updateQuery.deletedAt) {
    this.setUpdate({ ...updateQuery, $unset: { restoredAt: 1 } });
  }
  if (updateQuery.restoredAt) {
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
userSchema.pre(["deleteOne", "findOneAndDelete"], function () {
  //////// to check search query or filter

  const query = this.getFilter();
  if (query.force) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ deletedAt: { $exists: true }, ...query });
  }
});
export const userModel = models.User || model<IUser>("User", userSchema);
