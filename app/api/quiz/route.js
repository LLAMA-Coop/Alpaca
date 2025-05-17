import { catchRouteError, getNanoId } from "@/lib/db/helpers";
import { unauthorized } from "@/lib/apiErrorResponses";
import { Validator } from "@/lib/validation";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import { db } from "@/lib/db/db.js";

// CREATE QUIZ
export async function POST(req) {
    const publicId = getNanoId();
    let quizId = null;

    const quiz = await req.json();
    const {
        type,
        prompt,
        choices,
        answers,
        hints,
        sources,
        notes,
        courses,
        tags,
        permissions: perm,
    } = quiz;

    try {
        const user = await useUser({ token: (await cookies()).get("token")?.value });
        if (!user) return unauthorized;

        const validator = new Validator();

        validator.validateAll(
            [
                ["type", type],
                ["prompt", prompt],
                ["choices", choices],
                ["answers", answers],
                ["hints", hints],
                ["sources", sources],
                ["notes", notes],
                ["courses", courses],
            ].map(([field, value]) => ({ field, value })),
            "quiz"
        );

        validator.validate({ field: "tags", value: tags, type: "misc" });

        const permissions = validator.validatePermissions(perm, true);

        if (type === "multiple-choice" && !choices.length) {
            validator.addError({
                field: "choices",
                message: "Multiple choice questions need at least one choice",
            });
        }

        if (!notes.length && !sources.length) {
            validator.addError({
                field: "sources",
                message: "Quizzes need at least one source or note",
            });

            validator.addError({
                field: "notes",
                message: "Quizzes need at least one source or note",
            });
        }

        if (!validator.isValid) {
            return NextResponse.json(
                {
                    message: "Invalid quiz data.",
                    errors: validator.errors,
                },
                { status: 400 }
            );
        }

        await db
            .insertInto("quizzes")
            .values({
                publicId,
                type,
                prompt,
                choices: JSON.stringify(choices),
                answers: JSON.stringify(answers),
                hints: JSON.stringify(hints),
                tags: JSON.stringify(tags),
                createdBy: user.id,
            })
            .execute();

        quizId = (
            await db
                .selectFrom("quizzes")
                .select("id")
                .where("publicId", "=", publicId)
                .executeTakeFirstOrThrow()
        ).id;

        if (sources.length) {
            await db
                .insertInto("resource_relations")
                .values(
                    sources.map((s) => ({
                        A: quizId,
                        B: s,
                        A_type: "quiz",
                        B_type: "source",
                        // includeReference: false,
                        // reference: null,
                        // referenceType: null,
                    }))
                )
                .execute();
        }

        if (courses.length) {
            await db
                .insertInto("resource_relations")
                .values(
                    courses.map((c) => ({
                        A: quizId,
                        B: c,
                        A_type: "quiz",
                        B_type: "course",
                        // includeReference: false,
                        // reference: null,
                        // referenceType: null,
                    }))
                )
                .execute();
        }

        await db
            .insertInto("resource_permissions")
            .values({
                resourceId: quizId,
                resourceType: "quiz",
                ...permissions,
            })
            .execute();

        return NextResponse.json(
            {
                message: "Successfully created quiz",
                content: {
                    id: quizId,
                    publicId,
                    ...quiz,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        db.deleteFrom("quizzes").where("publicId", "=", publicId).execute();

        if (quizId) {
            db.deleteFrom("resource_permissions").where("resourceId", "=", quizId).execute();
        }

        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
