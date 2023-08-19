import { NextResponse } from "next/server";

export const unauthorized = NextResponse.json(
    {
        message: "Unauthorized",
    },
    {
        status: 401,
    },
);
