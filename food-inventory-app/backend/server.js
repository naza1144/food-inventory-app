import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import authRoutes from './routes/authRoutes.js'
import foodRoutes from './routes/foodRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import db from './config/database.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Security Middleware
app.use(helmet())

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static Files
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/food', foodRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Food Inventory API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      food: '/api/food'
    }
  })
})

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Error Handler (must be last)
app.use(errorHandler)

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  
  // Test database connection
  try {
    await db.query('SELECT NOW()')
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
})

export default app
