import { NextResponse } from "next/server";
import { User, Group } from "@/app/api/models";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";

export function PUT(req){
    // For changing description (admin only), and escalating users (owner only)
}

export function DELETE(){}