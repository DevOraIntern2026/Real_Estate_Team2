import dns from "node:dns";
import { connect } from "mongoose";
import { DB_URI } from "../common/config/config";
import { categoryModel, propertyModel, userModel } from "./models";

export const mongoDBConnection = async () => {
  try {
    // Configure reliable DNS servers to prevent querySrv ECONNREFUSED on Windows
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await connect(DB_URI as string);
    await Promise.all([
      userModel.syncIndexes(),
      categoryModel.syncIndexes(),
      propertyModel.syncIndexes(),
    ]);
    console.log(`Connected to mongoDB successfully`);
  } catch (error) {
    console.error(`❌ Failed to connect to mongoDB: ${error}`);
    console.error(
      `👉 Hint: If using MongoDB Atlas, check that your IP is whitelisted (Network Access -> Add IP Address / 0.0.0.0/0).`,
    );
  }
};
