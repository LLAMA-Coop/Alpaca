import { NextResponse } from "next/server";
import User from "@models/User";
import { useUser } from "@/lib/auth";
import { unauthorized } from "@/lib/apiErrorResponses";

export async function GET(req) {
    const user = await useUser();

    if(!user || !user.roles.contains("admin")){
        return unauthorized;
    }

    const content = await User.find();
    return NextResponse.json({
        200: {
            content,
        },
    });
}
