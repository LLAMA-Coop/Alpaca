export async function removeImageFromCDN(id) {
    try {
        const pk = process.env.UPLOADCARE_PUBLIC_KEY;
        const sk = process.env.UPLOADCARE_SECRET_KEY;

        return await fetch(`https://api.uploadcare.com/files/${id}/storage/`, {
            method: "DELETE",
            headers: {
                Authorization: `Uploadcare.Simple ${pk}:${sk}`,
                Accept: "application/vnd.uploadcare-v0.7+json",
            },
        });
    } catch (error) {
        console.log(error);
        throw new Error("Error removing image with ID: " + id + ".");
    }
}
