import "dotenv/config";
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
        database: process.env.DATABASE_NAME,
    });

    const query = util.promisify(conn.query).bind(conn);

    try {
        const sqlContent = fs
            .readFileSync("./lib/db/progress_migration_v2.sql")
            .toString();
        
        const queries = sqlContent.split(";").filter(q => q.trim() !== "" && !q.trim().startsWith("--"));

        for (const q of queries) {
            try {
                await query(q);
                console.log(`✓ Executed: ${q.substring(0, 60)}...`);
            } catch (error) {
                console.error(`✗ Error: ${error.message}`);
            }
        }

        console.log("\n✓ Progress migration v2 completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        conn.end();
    }
})();
