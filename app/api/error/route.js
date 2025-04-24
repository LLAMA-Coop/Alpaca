import { db } from "@/lib/db/db";
import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";

const webhookUrl = process.env.DISCORD_ERRORS_WEBHOOK;

export async function POST(req) {
    const { message, stack, url, userInfo, isClient, report } = await req.json();

    try {
        await db
            .insertInto("error_logs")
            .values({
                route: url || "Unknown",
                name: "Client Log",
                message: message || "Unknown",
                code: "Unknown",
                stack: JSON.stringify(stack) || "Unknown",
            })
            .execute();

        if (webhookUrl) {
            const embed = {
                title: isClient
                    ? report
                        ? "Someone reported an error on the website"
                        : "An error occurred on the website"
                    : "An error occurred on the server",
                description: `
                    **${report ? "Title" : "Message"}:** ${message}\n
                    **${report ? "Description" : "Stack"}:** ${stack}\n
                    ${report && `**URL**: ${url}`}
                `,
                fields: [
                    {
                        name: "User info",
                        value: JSON.stringify(userInfo, null, 4),
                    },
                ],
                color: 14427686,
            };

            const response = await fetch(`${webhookUrl}?wait=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ embeds: [embed] }),
            });

            if (!response.ok) {
                throw new Error("Failed to send error report to Discord webhook");
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
