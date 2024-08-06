import { unauthorized } from "@/lib/apiErrorResponses";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
// import { User } from "@models";
import { db } from "@/lib/db/db.js";

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const [deletion, fields] = await db
            .promise()
            .query(
                "DELETE FROM `Associates` WHERE (`A` = ? AND `B` = ?) OR (`A` = ? AND `B` = ?)",
                [user.id, id, id, user.id],
            );

        console.log(deletion);

        // const associate = await User.findOne({ _id: id });

        // if (!associate) {
        //     return NextResponse.json(
        //         {
        //             success: false,
        //             message: "No user found with that ID.",
        //         },
        //         { status: 404 },
        //     );
        // }

        // if (!user.associates.includes(associate.id)) {
        //     return NextResponse.json(
        //         {
        //             success: false,
        //             message: "User is not an associate.",
        //         },
        //         { status: 400 },
        //     );
        // } else {
        //     await User.updateOne(
        //         { _id: user.id },
        //         { $pull: { associates: associate.id } },
        //     );

        //     await User.updateOne(
        //         { _id: associate.id },
        //         { $pull: { associates: user.id } },
        //     );
        // }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully removed associate.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("[ERROR] /api/associates/id:DELETE ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 },
        );
    }
}
