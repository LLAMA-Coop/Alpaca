import { CamelCasePlugin, Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";

export const db =
    global.db ||
    new Kysely({
        dialect: new MysqlDialect({
            pool: createPool({
                database: process.env.DATABASE_NAME || "alpaca",
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                port: process.env.DATABASE_PORT || 3306,
                connectionLimit: process.env.DATABASE_CONNECTION_LIMIT || 10,
                typeCast(field, next) {
                    if (field.type.includes("BLOB")) {
                        return JSON.parse(field.string());
                    } else {
                        return next();
                    }
                },
            }),
        }),
        plugins: [new CamelCasePlugin()],
        // log: ["query"],
    });

global.db = db;
