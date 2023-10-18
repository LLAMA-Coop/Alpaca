import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
    try {

        const user = await useUser({token: cookies().get("token")?.value});
        if (!user) {
            return unauthorized;
        }

        const { message, source, lineno, colno, error } = await req.json();

        console.log("In error log route", message);
    } catch {
        console.error(`[Error] POST error: ${error}`);
        return server;
    }
}
