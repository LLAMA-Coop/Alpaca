import Note from "../models/Note";

export async function GET(req) {
  const content = await Note.find();
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
  // Will need to get author from authentication
  // Author refers to the user that made the note
  // and that should be the person signed in
  // Eventually, there will be guards checking authentication before the request even comes here

  // Will need to redesign once images/videos are permitted in notes

  const author = "Joe";
  if (!author) {
    return new Response(
      JSON.stringify({
        400: {
          message:
            "User information was not submitted. This may be because the user is not signed in.",
        },
      })
    );
  }

  if (!body.text) {
    return new Response(
      JSON.stringify({
        400: {
          message: "No text was added to this note",
        },
      }),
      { status: 400 }
    );
  }

  if (body.sources.length < 1) {
    return new Response(
      JSON.stringify({
        400: {
          message: "At least one source is required to create a note",
        },
      }),
      { status: 400 }
    );
  }

  let noteRcvd = {
    author,
    text: body.text,
    sources: [...body.sources],
  };

  const note = new Note(noteRcvd);
  let content = await note.save();
  return new Response(JSON.stringify({ 200: { content } }));
}
