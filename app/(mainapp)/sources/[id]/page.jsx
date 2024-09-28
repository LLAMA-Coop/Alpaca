import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function SourcePage({ params }) {
    const { id } = params;

    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) return redirect("/login");

    // const {source} = await getS
    // if (!source) return redirect("/sources");

    return null;
}
