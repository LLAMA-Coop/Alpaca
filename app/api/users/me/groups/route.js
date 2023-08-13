import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import User from "@models/User";

export async function GET(req) {
    const user = await useUser();

    if (!user) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            { status: 401 },
        );
    }

    return await User.findOne({ _id: user._id }).populate("groups").groups;
}
