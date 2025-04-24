import { UploadThingError } from "uploadthing/server";
import { createUploadthing } from "uploadthing/next";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
    avatarOrIcon: f({
        image: { maxFileSize: "2MB", maxFileCount: 1, minFileCount: 1 },
    })
        .middleware(async () => {
            const user = await useUser({
                token: (await cookies()).get("token")?.value || "",
            });

            if (!user) throw new UploadThingError("Unauthorized");

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => ({
            fileId: file.key,
            userId: metadata.userId,
        })),
};
