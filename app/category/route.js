import { NextResponse } from "next/server";
import { canEdit, queryReadableResources, useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import Category from "../api/models/Category"; // Don't forget to add this to index.js
import { unauthorized, server } from "@/lib/apiErrorResponses";
import { buildPermissions } from "@/lib/permissions";
import { PUT } from "../api/note/route";
import { Types } from "mongoose";
import { serializeOne } from "@/lib/db";

export async function GET(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const content = await Category.find(queryReadableResources(user));
        return NextResponse.json({
            content,
        });
    } catch (error) {
        console.error(`[Category] GET error: ${error}`);
        return server;
    }
}

export async function POST(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) {
            return unauthorized;
        }

        const { name, subcategoryOf, prerequisites, permissions } = req.json();

        if (!name) {
            return NextResponse.json(
                { message: "Missing required information" },
                { status: 400 },
            );
        }

        const category = new Category({
            name,
            subcategoryOf,
            prerequisites,
        });

        category.permissions = buildPermissions(permissions);

        const content = await category.save();

        return NextResponse.json(
            {
                message: "Category created successfully",
                content,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Category] POST error: ${error}`);
        return server;
    }
}

export async function PUT(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const { _id, name, subcategoryOf, prerequisites, permissions } =
            await req.json();

        const category = await Category.findById(_id);
        if (!category) {
            return NextResponse.json(
                {
                    message: `No category found with id ${_id}`,
                },
                { status: 404 },
            );
        }

        if (!canEdit(category, user)) {
            return NextResponse.json(
                {
                    message: `You are not permitted to edit category ${_id}`,
                },
                { status: 403 },
            );
        }

        if (name) {
            category.name = name;
        }
        if (subcategoryOf) {
            subcategoryOf.forEach((catId_req) => {
                if (
                    category.subcategoryOf.find(
                        (catId) => catId.toString() == catId_req,
                    )
                ) {
                    category.subcategoryOf.push(new Types.ObjectId(catId_req));
                }
            });
        }
        if (prerequisites) {
            prerequisites.forEach((catId_req) => {
                if (
                    category.prerequisites.find(
                        (catId) => catId.toString() == catId_req,
                    )
                ) {
                    category.prerequisites.push(new Types.ObjectId(catId_req));
                }
            });
        }

        if (
            permissions &&
            category.createdBy.toString() === user._id.toString()
        ) {
            category.permissions = serializeOne(permissions);
        }
        category.updatedBy = user._id;

        const content = await category.save();
        return NextResponse.json({ content });
    } catch (error) {
        console.error(`[Category] PUT error: ${error}`);
        return server;
    }
}
