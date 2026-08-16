import { Client } from "pg";

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function connectWithRetry(client: Client) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 15; attempt += 1) {
    try {
      await client.connect();
      return;
    } catch (error) {
      lastError = error;
      const delay = Math.min(100 * 2 ** attempt, 2000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function ensureDatabase() {
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
  const adminClient = new Client({ connectionString: targetUrl.toString() });

  try {
    await connectWithRetry(adminClient);
    const result = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      console.log(`✅ Created database ${databaseName}`);
    }
  } finally {
    await adminClient.end();
  }
}