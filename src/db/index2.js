import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// this is how we conect the database seprately:

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MongoDB_URL}/${DB_NAME}`
    );
    console.log(
      `mongoDb connect !! DB Host:${connectionInstance.connection.host}`
    );
    // console.log(connectionInstance);
  } catch (error) {
    console.log("Mongodb connection error: ", error);
    // throw and process.exit both use to teminate the code: exit code are of different type hover it or google search
    process.exit(1);
  }
};

export default connectDB;
