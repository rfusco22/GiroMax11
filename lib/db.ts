import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: "Z",
      connectTimeout: 10000,
    }

    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(sql, params)
    return rows as T[]
  } catch (error) {
    console.error("[Database Error]", error)
    throw error
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results.length > 0 ? results[0] : null
}

export const db = {
  query,
  queryOne,
  getPool,
}
