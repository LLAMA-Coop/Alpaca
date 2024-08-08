import { unauthorized } from "@/lib/apiErrorResponses";
import { removeImageFromCDN } from "@/lib/cdn";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser, authenticateUser } from "@/lib/auth";
import SubmitErrors from "@/lib/SubmitErrors";
import bcrypt from "bcrypt";

export async function PATCH(req) {
    const {
        password,
        username,
        newPassword,
        displayName,
        description,
        avatar,
    } = await req.json();

    const setValues = [];

    try {
        const user = await authenticateUser({
            token: cookies().get("token")?.value,
            password,
        });
        if (!user) return unauthorized;

        // const passwordsMatch = await bcrypt.compare(
        //     password,
        //     user.passwordHash,
        // );

        // if (!passwordsMatch) {
        //     return NextResponse.json(
        //         {
        //             success: false,
        //             message: "Incorrect password",
        //         },
        //         { status: 401 },
        //     );
        // }

        const submitErrors = new SubmitErrors();

        if (newPassword && newPassword !== password) {
            const passwordHash = await bcrypt.hash(newPassword, 10);
            setValues.push({ name: `passwordHash`, value: passwordHash });
            // db.promise().query(
            //     "UPDATE `Users` SET `passwordHash` = ? WHERE `id` = ?",
            //     [passwordHash, user.id],
            // );

            // await User.findByIdAndUpdate(user.id, {
            //     passwordHash: passwordHash,
            // });

            // return NextResponse.json(
            //     {
            //         content,
            //         success: true,
            //         message: "Successfully updated user.",
            //     },
            //     { status: 200 },
            // );
        }

        if (username && username !== user.username) {
            const checkForUsername = await useUser({ username });
            if (checkForUsername) {
                submitErrors.addError("Username is not available");
            } else {
                setValues.push({ name: "username", value: username });
            }

            // if (await User.exists({ username })) {
            //     return NextResponse.json(
            //         {
            //             success: false,
            //             message: "Username already exists",
            //         },
            //         { status: 409 },
            //     );
            // }

            // const passwordsMatch = await bcrypt.compare(
            //     password,
            //     user.passwordHash,
            // );

            // if (!passwordsMatch) {
            //     return NextResponse.json(
            //         {
            //             success: false,
            //             message: "Incorrect password",
            //         },
            //         { status: 401 },
            //     );
            // }

            // await User.findByIdAndUpdate(user.id, {
            //     username,
            // });
        }

        if (avatar && avatar !== user.avatar) {
            setValues.push({ name: "avatar", value: avatar });
            // if ((avatar || avatar === "") && user.avatar) {
            //     // Remove old avatar
            //     await removeImageFromCDN(user.avatar);
            // }

            // await User.findByIdAndUpdate(user.id, {
            //     displayName: displayName || user.displayName,
            //     description: description || user.description,
            //     avatar: avatar || (avatar === "" ? null : user.avatar),
            // });
        }

        if (displayName && displayName !== user.displayName) {
            setValues.push({ name: "displayName", value: displayName });
        }

        if (description && description !== user.description) {
            setValues.push({ name: "description", value: description });
        }

        if (setValues.length > 0) {
            const query = `UPDATE \`Users\` SET ${setValues
                .map((x) => `${x.name} = ?`)
                .join(", ")} WHERE \`id\` = ?`;

            console.log(query);
            const content = await db
                .promise()
                .query(query, [...setValues.map((x) => x.value), user.id]);

            return NextResponse.json(
                {
                    content,
                    errors:
                        submitErrors.errors.length > 0
                            ? submitErrors.errors
                            : "None",
                    success: true,
                    message: "Successfully updated user.",
                },
                { status: 200 },
            );
        }

        return NextResponse.json(
            {
                errors:
                    submitErrors.errors.length > 0
                        ? submitErrors.errors
                        : "None",
                success: false,
                message: "Unable to update user",
            },
            { status: 400 },
        );
    } catch (error) {
        console.error("[ERROR] /api/users/me:PATCH ", error);

        if (avatar) {
            // Remove new avatar
            await removeImageFromCDN(avatar);
        }

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
