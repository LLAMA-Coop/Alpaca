import { generateReactHelpers } from "@uploadthing/react";
import { getApiUrl } from "./api";

export const { useUploadThing, uploadFiles } = generateReactHelpers({
    url: `${getApiUrl()}/uploadthing`,
});
