import Source from "../models/Source";

export async function GET(req) {
  let sources = await Source.find();
  return new Response(
    JSON.stringify({
      "200": {
        content: sources
      }
    })
  );
}

export async function POST(req) {
  
}