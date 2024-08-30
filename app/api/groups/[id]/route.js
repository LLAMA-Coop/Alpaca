import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";

export function PUT(req) {
    // For changing description (admin only), and escalating users (owner only)
}

export function DELETE() {}

export async function GET(req, { params }) {
    const { id } = params;
    console.log(`You have reached the route for Group ${id}`);

    return NextResponse.json(
        {
            success: true,
            message: "Successfully invited user to group.",
        },
        { status: 200 },
    );
}
