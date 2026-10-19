import { model, models, Schema } from "mongoose";
import { IInquiry, IMessage } from "../../common/interfaces";

const inquirySchema = new Schema<IInquiry>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true, maxLength: 100 },
    customerEmail: { type: String, required: true, maxLength: 100 },
    customerPhone: { type: String, required: true, maxLength: 150 },
    status: {
      type: String,
      enum: ["new", "responded", "closed", "pending", "replied"],
      default: "new",
    },
    subject: { type: String, maxLength: 200 },
    message: { type: String, maxLength: 2000 },
    lastMessage: { type: String, maxLength: 2000 },
    lastMessageAt: { type: Date, default: Date.now },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "Inquiries",
  },
);

inquirySchema.index({ property: 1 });
inquirySchema.index({ owner: 1, status: 1 });
inquirySchema.index({ agent: 1, status: 1 });
inquirySchema.index({ customer: 1, status: 1 });
inquirySchema.index({ customerEmail: 1 });
inquirySchema.index({ customerPhone: 1 });
inquirySchema.index({ createdAt: -1 });

inquirySchema.pre(["findOne", "find"], function () {
  const query = this.getFilter();
  if (query.paranoid === false) return;
  this.setQuery({ ...query, deletedAt: { $exists: false } });
});

export const inquiryModel =
  models.Inquiry || model<IInquiry>("Inquiry", inquirySchema);

const messageSchema = new Schema<IMessage>(
  {
    inquiry: { type: Schema.Types.ObjectId, ref: "Inquiry", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    senderRole: {
      type: String,
      enum: ["customer", "owner", "agent", "admin"],
      required: true,
    },
    senderType: { type: String },
    senderName: { type: String, maxLength: 100 },
    text: { type: String, required: true, maxLength: 2000 },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "Messages",
  },
);

messageSchema.index({ inquiry: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

export const messageModel =
  models.Message || model<IMessage>("Message", messageSchema);
