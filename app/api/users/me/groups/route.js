import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import User from "@models/User";
import { unauthorized } from "@/lib/apiErrorResponses";

export async function GET(req) {
    const user = await useUser();

    if (!user) {
        return unauthorized;
    }

    return await User.findOne({ _id: user._id }).populate("groups").groups;
}
