import fs from "fs";

export function logToFile(message) {
    console.log(message);

    if (process.env.NODE_ENV === "production") {
        if (!fs.existsSync("logs")) {
            fs.mkdirSync("logs");
        }

        fs.appendFile("logs/app.log", `${new Date().toISOString()} - ${message}\n`, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }
}
