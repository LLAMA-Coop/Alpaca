"use server";

import { getPermittedResources } from "@/lib/db/helpers";
import { cookies } from "next/headers";

export async function getQuizzes({ tag, user, offset, limit }) {
    const _cookies = cookies();

    try {
        const { quizzes, hasMoreQuizzes } = await getPermittedResources({
            withQuizzes: true,
            userId: user?.id,
            offset,
            limit,
            tagSearch: tag || undefined,
        });

        return {
            quizzes,
            hasMore: hasMoreQuizzes,
        };
    } catch (error) {
        console.log(error);
        throw new Error(`An error happened: ${error}`);
    }
}
