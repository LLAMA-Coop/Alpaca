import { NextResponse } from "next/server";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";
// import { Group } from "@mneme_app/database-models";
// import User from "@mneme_app/database-models";
// import { User, Group } from "@/app/api/models";
import SubmitErrors from "@/lib/SubmitErrors";
import { MAX } from "@/lib/constants";
import { db } from "@/lib/db/db.js";
import { addError } from "@/lib/db/helpers";

export async function POST(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) {
            return unauthorized;
        }

        const submitErrors = new SubmitErrors();

        const { name, description, isPublic, avatar } = await req.json();

        if (!name) {
            submitErrors.addError("Missing name");
        } else if (name?.length < 2 || name?.length > MAX.name) {
            submitErrors.addError(
                `The following group name is not 2 to ${MAX.name} characters in length:\n ${name}`,
            );
        }
        // const sameName = await Group.findOne({ name });
        const [sameName, sameNameFields] = await db
            .promise()
            .query("SELECT `id` FROM `Groups` WHERE `name` = ?", [name.trim()]);

        if (sameName.length > 0) {
            submitErrors.addError(`The group name ${name} already exists`);
        }

        if (description && description.length > MAX.description) {
            submitErrors.addError(
                `The following description exceeds the maximum permitted, which is ${MAX.description}: \n ${description}`,
            );
        }

        if (submitErrors.cannotSend) {
            return NextResponse.json(
                {
                    message: submitErrors.displayErrors(),
                    nameTaken: sameName != null,
                },
                { status: 400 },
            );
        }

        // const group = new Group({
        //     name: name.trim(),
        //     description: description.length > 0 ? description : null,
        //     icon: icon,
        //     owner: user.id,
        //     users: [user.id],
        //     admins: [user.id],
        // });

        const [group, groupFields] = await db
            .promise()
            .query(
                "INSERT INTO `Groups` (`name`, `description`, `isPublic`, `avatar`) VALUES (?, ?, ?, ?)",
                [name, description, isPublic, avatar],
            );

        // await User.updateOne(
        //     { _id: user.id },
        //     {
        //         $push: {
        //             groups: content.id,
        //         },
        //     },
        // );

        const [member, memberFields] = await db
            .promise()
            .query(
                "INSERT INTO `Members` (`groupId`, `userId`, `role`) VALUES (?, ?, 'owner')",
                [group.insertId, user.id],
            );

        const content = { group, member };

        return NextResponse.json(
            {
                message: "Group created successfully",
                content: content,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(`[Group] POST error: ${error}`);
        addError(error, "/api/groups: POST");
        return server;
    }
}
