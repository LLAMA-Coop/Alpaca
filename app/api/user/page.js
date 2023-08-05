import { NextResponse } from "next/server";
import User from "@models/User";

export async function GET(req) {
    // Will need to authorize administrator first

    const content = await User.find();
    return NextResponse.json({
        200: {
            content,
        },
    });
}
