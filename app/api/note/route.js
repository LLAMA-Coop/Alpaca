export async function GET(req) {
  return new Response(
    JSON.stringify({
      message: "You have successfully received a response from /api/note",
    })
  );
}
