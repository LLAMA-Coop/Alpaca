import { NextResponse } from "next/server";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        return NextResponse.json(
            { username: user.username, displayName: user.displayName },
            { status: 200 },
        );
    } catch (error) {
        console.error(`POST error for authentication`, error);
        return server;
    }
}
