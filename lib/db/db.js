import { createPool } from "mysql2";

export const db =
    global.db ||
    createPool({
        database: process.env.DATABASE_NAME,
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        port: 3306,
        connectionLimit: 10,
        typeCast(field, next) {
            // Return bigint as string
            if (field.type === "LONGLONG") {
                return field.string();
            } else if (field.type === "BLOB") {
                return JSON.parse(field.string());
            } else {
                return next();
            }
        },
    });

global.db = db;
