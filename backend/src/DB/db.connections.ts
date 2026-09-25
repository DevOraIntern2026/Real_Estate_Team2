import { connect } from "mongoose";
import { DB_URI } from "../common/config/config";
import { userModel } from "./models";

export const mongoDBConnection = async () => {
  try {
    await connect(DB_URI as string);
    await userModel.syncIndexes();
    console.log(`Connected to mongoDB successfully`);
  } catch (error) {
    console.log(`Failed to connect to mongoDB ${error}`);
  }
};
