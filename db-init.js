import mysql from "mysql2";
import util from "util";
import fs from "fs";

if (
    !process.env.DATABASE_HOST ||
    !process.env.DATABASE_USER ||
    !process.env.DATABASE_PASSWORD ||
    !process.env.DATABASE_NAME
) {
    console.error(
        "Please set DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME environment variables.",
    );
    process.exit(1);
}

(async () => {
    const conn = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
    });

    const query = util.promisify(conn.query).bind(conn);
    const db = process.env.DATABASE_NAME;

    try {
        await query(
            `CREATE DATABASE IF NOT EXISTS ${db} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
        );

        await query(`USE ${db}`);

        const queries = fs
            .readFileSync("./lib/db/tables.sql")
            .toString()
            .split(";");

        queries.forEach(async (q) => {
            if (q.trim() !== "") {
                await query(q);
            }
        });
    } catch (error) {
        console.error(error);
    } finally {
        conn.end();
    }
})();
