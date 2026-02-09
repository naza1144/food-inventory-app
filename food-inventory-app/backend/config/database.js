import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.dev' })

const { Pool } = pkg

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err)
  process.exit(-1)
})

export default pool
