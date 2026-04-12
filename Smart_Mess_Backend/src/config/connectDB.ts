import dotenv from "dotenv";
dotenv.config();
import { connect } from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing in .env");
    }
    const conn = await connect(process.env.MONGO_URI as string)
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Failed. Check your MONGO_URI in .env.");
    console.error(error);
    // process.exit(1); 
  }
};

export default connectDB;
