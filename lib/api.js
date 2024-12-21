const path = process.env.NEXT_PUBLIC_BASEPATH || "";

export function getApiUrl() {
    return path + "/api";
}
