import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import Category from "../../models/Category";
import { unauthorized, server } from "@/lib/apiErrorResponses";

export async function DELETE(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const { id } = params;

        const category = await Category.findById(id);
        if (!category) {
            return NextResponse.json(
                {
                    message: `Category with id ${id} could not be found`,
                },
                { status: 404 },
            );
        }

        if (category.createdBy.toString() !== user._id.toString()) {
            return NextResponse.json(
                {
                    message: `User ${user._id} is not authorized to delete category ${id}. Only the creator ${category.createdBy} is permitted`,
                },
                { status: 403 },
            );
        }

        const deletion = await Category.deleteOne({ id });
        if (deletion.deletedCount === 0) {
            console.error(`Unable to delete category with id ${id}`);
            return NextResponse.json(
                { message: `Unable to delete category ${id}` },
                { status: 500 },
            );
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[Category] DELETE error:\n ${error}`);
        return server;
    }
}
