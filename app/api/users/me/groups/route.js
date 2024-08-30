import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { addError, getUserGroups } from "@/lib/db/helpers";

export async function GET(req) {
    try {
        const token = cookies().get("token")?.value
        const user = await useUser({ token });

        if (!user) {
            return unauthorized;
        }

        const content = await getUserGroups(user.id);
        return NextResponse.json({
            content,
        });
    } catch (error) {
        addError(error, "/api/users/me/groups: GET");
        return server;
    }
}
