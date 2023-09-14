import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { Group } from "@mneme_app/database-models";
import User from "@mneme_app/database-models";

export async function POST(req) {
    try {
        const user = await useUser();
        if (!user) {
            return unauthorized;
        }

        const { name, description, icon } = await req.json();

        if (name?.length < 2 || name?.length > 100) {
            return NextResponse.json(
                {
                    message: "Name must be between 2 and 100 characters",
                },
                { status: 400 },
            );
        }
        const sameGroup = await Group.findOne({ name: name });

        if (sameGroup) {
            return NextResponse.json(
                {
                    message: "Group with this name already exists",
                },
                { status: 400 },
            );
        }

        const group = new Group({
            name: name,
            description: description.length > 0 ? description : null,
            icon: icon,
            owner: user.id,
            users: [user.id],
            admins: [user.id],
        });

        const content = await group.save();

        await User.updateOne(
            { _id: user.id },
            {
                $push: {
                    groups: content.id,
                },
            },
        );

        return NextResponse.json(
            {
                message: "Group created successfully",
                content: content,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Group] POST error: ${error}`);
        return server;
    }
}
