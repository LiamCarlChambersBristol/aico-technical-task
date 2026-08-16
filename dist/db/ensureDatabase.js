"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabase = ensureDatabase;
const pg_1 = require("pg");
function quoteIdentifier(identifier) {
    return `"${identifier.replace(/"/g, '""')}"`;
}
async function ensureDatabase() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set");
    }
    const targetUrl = new URL(databaseUrl);
    const databaseName = decodeURIComponent(targetUrl.pathname.slice(1)); // Removed misplaced environment assignment
    if (!databaseName) {
        throw new Error("DATABASE_URL does not specify a database name");
    }
    targetUrl.pathname = "/postgres";
    const adminClient = new pg_1.Client({ connectionString: targetUrl.toString() });
    try {
        await adminClient.connect();
        const result = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
        if (result.rowCount === 0) {
            await adminClient.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
            console.log(`✅ Created database ${databaseName}`);
        }
    }
    finally {
        await adminClient.end();
    }
}
