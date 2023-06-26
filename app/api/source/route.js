import Source from "../models/Source";

export async function GET(req) {
  let sources = await Source.find();
  return new Response(
    JSON.stringify({
      message: "You have successfully received a response from /api/source",
      sources
    })
  );
}
