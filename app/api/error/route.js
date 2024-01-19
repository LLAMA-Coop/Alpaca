import { NextResponse } from "next/server";

const url = process.env.DISCORD_ERRORS_WEBHOOK;

export async function POST(req) {
    const { message, stack, userInfo, isClient } = await req.json();

    try {
        const embed = {
            title: "An error occurred on the website",
            description: message,
            fields: [
                {
                    name: "Stack trace",
                    // Cant be more than 1024 characters
                    value: stack.slice(0, 1021) + "...",
                },
                {
                    name: "User info",
                    value: JSON.stringify(userInfo, null, 4),
                },
            ],
            color: 14427686,
        };

        console.log(embed);

        const response = await fetch(`${url}?wait=true`, {
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
    } catch {
        console.error(`[Error] POST error: ${error}`);
        return NextResponse.json(
            {
                error: "Failed to send error to Discord",
            },
            { status: 500 },
        );
    }
}
