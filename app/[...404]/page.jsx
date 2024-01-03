import { notFound } from "next/navigation";
// Note this file and 404 folder are required only for development purposes. There is a NextJS bug that keeps reloading the 404 page only in
// development mode. It is not required in Production.
// https://stackoverflow.com/questions/76585950/nextjs-not-found-page-keeps-reloading-every-3-seconds
export default function NotFound() {
    return notFound();
}
