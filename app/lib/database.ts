import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kopqela_loan',
  user: process.env.DB_USER || 'kopqela_user',
  password: process.env.DB_PASSWORD || 'your_password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export { pool }

// Helper function to execute queries
export async function query(text: string, params?: unknown[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Helper function to get a single result
export async function queryOne(text: string, params?: unknown[]) {
  const result = await query(text, params)
  return result.rows[0] || null
}

// Helper function to check database connection
export async function checkConnection() {
  try {
    await query('SELECT NOW()')
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Helper function to begin transaction
export async function beginTransaction() {
  const client = await pool.connect()
  await client.query('BEGIN')
  return {
    query: (text: string, params?: unknown[]) => client.query(text, params),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    release: () => client.release()
  }
} 