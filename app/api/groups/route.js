import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import Group from "@models/Group";
import User from "@models/User";

export async function POST(req) {
    const user = await useUser();

    if (!user) {
        return NextResponse.json(
            {
                message: "Unauthorized",
            },
            { status: 401 },
        );
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

    try {
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
        return NextResponse.json(
            {
                message: "Something went wrong",
            },
            { status: 500 },
        );
    }
}
