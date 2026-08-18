"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabase = ensureDatabase;
const pg_1 = require("pg");
function quoteIdentifier(identifier) {
    return `"${identifier.replace(/"/g, '""')}"`;
}
async function connectWithRetry(createClient) {
    let lastError;
    for (let attempt = 0; attempt < 15; attempt += 1) {
        const client = createClient();
        try {
            await client.connect();
            return client;
        }
        catch (error) {
            lastError = error;
            if (attempt < 14) {
                const delay = Math.min(100 * 2 ** attempt, 2000);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}
async function ensureDatabase() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not set");
    }
    const targetUrl = new URL(databaseUrl);
    const databaseName = decodeURIComponent(targetUrl.pathname.slice(1));
    if (!databaseName) {
        throw new Error("DATABASE_URL does not specify a database name");
    }
    targetUrl.pathname = "/postgres";
    const adminClient = await connectWithRetry(() => new pg_1.Client({ connectionString: targetUrl.toString() }));
    try {
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
