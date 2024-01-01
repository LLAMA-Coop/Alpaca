import { disconnect, connect } from "mongoose";

export default async function connectDB() {
    try {
        await connect(process.env.DATABASE_URL);
        console.log("Successfully connected to Database");
    } catch (e) {
        console.error(
            `Error connecting to Database\n${e.name}:\n  ${e.message}`,
        );
        return false;
    }
}

export async function disconnectDB() {
    try {
        await disconnect();
        console.log("Successfully disconnected from Database");
    } catch (e) {
        console.error(
            `Error disconnecting from Database\n${e.name}:\n  ${e.message}`,
        );
    }
}
