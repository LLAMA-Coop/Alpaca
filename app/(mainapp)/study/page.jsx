import { getPermittedResources } from "@/lib/db/helpers";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Study from "./Study";

export default async function StudyPage(props) {
  const user = await useUser({ token: (await cookies()).get("token")?.value });

  const { notes, quizzes, sources } = await getPermittedResources({
    userId: user ? user.id : undefined,
    withNotes: true,
    withQuizzes: true,
    withSources: true,
    limit: 10000,
  });

  return (
    <Study notes={notes} quizzes={quizzes} sources={sources} />
  );
}
