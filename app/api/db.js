import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    console.error(`Error connecting to Database\n${e.name}:\n  ${e.message}`);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("Successfully disconnected from Database");
  } catch (e) {
    console.error(
      `Error disconnecting from Database\n${e.name}:\n  ${e.message}`,
    );
  }
}
