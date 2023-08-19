import { NextResponse } from "next/server";

export const unauthorized = NextResponse.json(
    {
        message: "Unauthorized",
    },
    {
        status: 401,
    },
);

export const server = NextResponse.json(
    {
        message: "Something went wrong on our server",
    },
    {
        status: 500,
    },
);
