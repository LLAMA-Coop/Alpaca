import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Create from "./Create";
import InputDefaults from "./inputDefaults";

export default async function CreatePage() {
  const user = await useUser({ token: (await cookies()).get("token")?.value });
  if (!user) return redirect("/login?next=/create");

  return (
    <>
      <InputDefaults />
      <Create />
    </>
  );
}
