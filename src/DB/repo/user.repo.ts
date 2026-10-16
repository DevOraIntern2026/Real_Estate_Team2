import { IUser } from "../../common/interfaces";
import { userModel } from "../models";
import { DataBaseRepo } from "./base.repo";

export class UserRepo extends DataBaseRepo<IUser> {
  constructor() {
    super(userModel);
  }
}
