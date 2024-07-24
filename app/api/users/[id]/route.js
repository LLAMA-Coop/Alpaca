import { NextResponse } from "next/server";
// import { User } from "@mneme_app/database-models";
import { User, Group } from "@/app/api/models";
// import User from "@/app/api/models/User";
import { useUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import { serializeOne } from "@/lib/db";

// export async function GET(req, { params }) {
//     const { _id } = params;

//     try {
//         const user = serializeOne(
//             await useUser({ token: cookies().get("token")?.value }),
//         );
//         if (
//             !user ||
//             (user.id !== _id && user.roles.indexOf("admin") === -1)
//         ) {
//             return unauthorized;
//         }

//         const content = await User.find();
//         return NextResponse.json({
//             content,
//         });
//     } catch (error) {
//         console.error(`User [${_id}] GET error: ${error}`);
//         return server;
//     }
// }

export function DELETE(req, { params }) {}
