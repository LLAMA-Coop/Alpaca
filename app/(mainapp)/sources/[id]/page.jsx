import {
  jsonObject,
  permissionsDefaultColumns,
  userDefaultColumns,
} from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export default async function SourcePage({ params }) {
  const { id } = params;

  let source = await db
    .selectFrom("sources")
    .selectAll()
    .select(({ selectFrom }) => [
      selectFrom("resource_permissions as rp")
        .select(
          jsonObject({
            list: permissionsDefaultColumns,
            table: "rp",
          })
        )
        .whereRef("rp.resourceId", "=", "sources.id")
        .where("rp.resourceType", "=", "source")
        .as("permissions"),
      selectFrom("users")
        .select(
          jsonObject({
            list: userDefaultColumns,
            table: "users",
          })
        )
        .whereRef("users.id", "=", "sources.createdBy")
        .as("creator"),
    ])
    .where("public_id", "=", id)
    .executeTakeFirst();

  const user = await useUser({ token: cookies().get("token")?.value });
  if (!user) return redirect(`/login?next=/sources/${id}`);
  source.creator = JSON.parse(source.creator);

  if (
    !source ||
    (!source.permissions?.allRead &&
      !source.permissions.read.includes(user.id) &&
      source.creator.id !== user.id)
  ) {
    redirect("/sources");
  }

  return (
    <main>
      <header>
        <h1>
          Source by {source.creator.username}
          <br />
          {source.title}
        </h1>
      </header>
      <section>
        <h2>Everything you need to know about source</h2>
        <pre>{JSON.stringify(source, null, 2)}</pre>
      </section>
    </main>
  );
}
