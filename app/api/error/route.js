import { catchRouteError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";

const webhookUrl = process.env.DISCORD_ERRORS_WEBHOOK;

// SEND ERROR TO DISCORD

export async function POST(req) {
    const { message, stack, url, userInfo, isClient, report } =
        await req.json();

    if (!webhookUrl) {
        return NextResponse.json(
            {
                message: "Reports have been disabled",
            },
            { status: 400 },
        );
    }

    try {
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
            console.error(
                `[Error] POST error: ${response.status} ${response.statusText}`,
            );

            return NextResponse.json(
                {
                    error: "Failed to send error to Discord",
                },
                { status: 500 },
            );
        } else {
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        return catchRouteError({ error, route: req.nextUrl.pathname });
    }
}
