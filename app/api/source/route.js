import Source from "../models/Source";

export async function GET(req) {
  const content = await Source.find();
  return new Response(
    JSON.stringify({
      200: {
        content,
      },
    })
  );
}

export async function POST(req) {
  const body = await req.json();
  if (!(body.title && body.medium && body.url)) {
    return new Response(
      JSON.stringify({
        400: {
          message: "Missing required information",
        },
      }),
      {
        status: 400,
      }
    );
  }

  let srcRcvd = {
    title: body.title,
    medium: body.medium,
    url: body.url,
    addedBy: "64b841f6f8bfa3dc4d7079e4" // This needs to be replaced
  };

  if (body.contributors && body.contributors.length > 0) {
    srcRcvd.contributors = [...body.contributors];
  }
  if (body.lastAccessed) {
    srcRcvd.lastAccessed = body.lastAccessed;
  }
  if (body.publishedDate) {
    srcRcvd.publishedDate = body.publishedDate;
  }

  const source = new Source(srcRcvd);
  let content = await source.save();
  return new Response(
    JSON.stringify({
      200: {
        content,
      },
    })
  );
}
