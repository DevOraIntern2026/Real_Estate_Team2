import { connect } from "mongoose";
import { DB_URI } from "../common/config/config";
import { categoryModel, propertyModel, userModel } from "./models";

export const mongoDBConnection = async () => {
  try {
    await connect(DB_URI as string);
    await Promise.all([
      userModel.syncIndexes(),
      categoryModel.syncIndexes(),
      propertyModel.syncIndexes(),
    ]);
    console.log(`Connected to mongoDB successfully`);
  } catch (error) {
    console.log(`Failed to connect to mongoDB ${error}`);
  }
};
