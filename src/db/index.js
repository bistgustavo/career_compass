import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Ensure the URI is properly formatted
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Connect with database name
    const connectionInstance = await mongoose.connect(mongoURI, {
      dbName: DB_NAME,
    });
    
    console.log(
      `\n✅ MongoDB connected successfully! DB Host: ${connectionInstance.connection.host}`
    );
    console.log(`Database: ${connectionInstance.connection.db.databaseName}`);
    
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    process.exit(1);
  }
};

export default connectDB;
