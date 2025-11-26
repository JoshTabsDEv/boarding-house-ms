import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params: Array<string | number | null> = [],
) {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}

export async function execute(
  sql: string,
  params: Array<string | number | null> = [],
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

