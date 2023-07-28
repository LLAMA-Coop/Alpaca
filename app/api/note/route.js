import { NextResponse } from "next/server";
import Note from "../models/Note";

export async function GET(req) {
  const content = await Note.find();
  return NextResponse.json({
    200: {
      content,
    },
  });
}

export async function POST(req) {
  const body = await req.json();
  // Will need to get author from authentication
  // addedBy refers to the user that made the note
  // and that should be the person signed in
  // Eventually, there will be guards checking authentication before the request even comes here
  // As well as a check on authorization to make notes

  // Will need to redesign once images/videos are permitted in notes

  // addedBy needs to come from cookie
  // Should probably verify user real and active
  const addedBy = "64b841f6f8bfa3dc4d7079e4";
  if (!addedBy) {
    return NextResponse.json(
      {
        400: {
          message:
            "User information was not submitted. This may be because the user is not signed in.",
        },
      },
      { status: 400 }
    );
  }

  if (!body.text) {
    return NextResponse.json(
      {
        400: {
          message: "No text was added to this note",
        },
      },
      { status: 400 }
    );
  }

  if (body.sources.length < 1) {
    return NextResponse.json(
      {
        400: {
          message: "At least one source is required to create a note",
        },
      },
      { status: 400 }
    );
  }

  let noteRcvd = {
    addedBy,
    text: body.text,
    sources: [...body.sources],
  };

  const note = new Note(noteRcvd);
  let content = await note.save();
  return NextResponse.json({ 200: { content } });
}
