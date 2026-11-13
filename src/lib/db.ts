import mysql, { type ResultSetHeader } from "mysql2/promise";

/**
 * Server-only pool for the application database `on_the_ledge`.
 * Never import this from a client component.
 */
const globalForDb = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
};

function databaseName() {
  const name =
    process.env.DB_NAME ?? process.env.MYSQL_DATABASE ?? "on_the_ledge";
  if (name !== "on_the_ledge") {
    throw new Error(
      "This app only connects to the on_the_ledge database.",
    );
  }
  return name;
}

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST ?? process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? process.env.MYSQL_PORT ?? "3306"),
    user: process.env.DB_USER ?? process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD,
    database: databaseName(),
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    decimalNumbers: true,
  });
}

export function getPool(): mysql.Pool {
  if (!globalForDb.mysqlPool) {
    globalForDb.mysqlPool = createPool();
  }
  return globalForDb.mysqlPool;
}

type QueryParams = Record<string, string | number | null>;

export async function query<T>(
  sql: string,
  params?: QueryParams,
): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

export async function execute(
  sql: string,
  params?: QueryParams,
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute(sql, params);
  return result as ResultSetHeader;
}

export function dbErrorMessage(error: unknown): string {
  const raw =
    error && typeof error === "object" && "sqlMessage" in error
      ? String((error as { sqlMessage?: string }).sqlMessage)
      : error instanceof Error
        ? error.message
        : "Database error";
  const rejected = raw.match(/Rejected:[^.]+/);
  if (rejected) return rejected[0].trim();
  if (raw.includes("FAILED:")) return raw.replace(/^FAILED:\s*/, "");
  return raw;
}
