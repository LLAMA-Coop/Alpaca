export async function register() {
    console.log("HOORAY! I'M REGISTERING!")
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("./db-init.js");
    }
}
