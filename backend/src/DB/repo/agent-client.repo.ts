import { IAgentClient } from "../../common/interfaces";
import { agentClientModel } from "../models";
import { DataBaseRepo } from "./base.repo";

export class AgentClientRepo extends DataBaseRepo<IAgentClient> {
  constructor() {
    super(agentClientModel);
  }
}
