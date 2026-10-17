import { model, models, Schema } from "mongoose";
import { IAgentClient } from "../../common/interfaces";

const agentClientSchema = new Schema<IAgentClient>(
  {
    agent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, maxLength: 1000 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "AgentClients",
  },
);

agentClientSchema.index({ agent: 1, client: 1 }, { unique: true });
agentClientSchema.index({ agent: 1, status: 1 });
agentClientSchema.index({ client: 1 });

export const agentClientModel =
  models.AgentClient || model<IAgentClient>("AgentClient", agentClientSchema);
