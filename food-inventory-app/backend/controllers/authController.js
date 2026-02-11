import User from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return next(new AppError('อีเมลนี้ถูกใช้งานแล้ว', 400))
    }

    // Create new user
    const user = await User.create({ name, email, password })

    // Generate token
    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findByEmail(email)
    if (!user) {
      return next(new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401))
    }

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password)
    if (!isPasswordValid) {
      return next(new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401))
    }

    // Generate token
    const token = generateToken(user.id)

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    })
  } catch (error) {
    next(error)
  }
}

export const verifyToken = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    })
  } catch (error) {
    next(error)
  }
}