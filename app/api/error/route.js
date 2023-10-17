import { useUser } from "@/lib/auth";

export async function POST(req) {
    try {
        const user = await useUser();
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
