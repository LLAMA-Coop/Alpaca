import { addError } from "@/lib/db/helpers";
import { NextResponse } from "next/server";

// const webhookUrl = process.env.DISCORD_ERRORS_WEBHOOK;

export async function POST(req) {
    const { message, stack, url, userInfo, isClient, report } =
        await req.json();

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

        console.log(embed);

        // const response = await fetch(`${webhookUrl}?wait=true`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ embeds: [embed] }),
        // });

        const response = await addError(
            {
                name: message,
                message: embed.title,
                code: `UserInfo: ${JSON.stringify(userInfo)}`,
                stack: embed.description,
            },
            url,
        );

        // if (!response.ok) {
        if (response.affectedRows === 0) {
            console.error(
                `[Error] POST error: ${response.status} ${response.statusText}`,
            );
            addError({ stack: response }, "/api/error: POST");

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
        console.error(`[Error] POST error: ${error}`);
        addError(error, "/api/error: POST");
        return NextResponse.json(
            {
                // error: "Failed to send error to Discord",
                error: "Failed to log error",
            },
            { status: 500 },
        );
    }
}
