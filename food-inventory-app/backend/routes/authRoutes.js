import express from 'express'
import { signup, login, verifyToken } from '../controllers/authController.js'
import { signupValidation, loginValidation, validate } from '../middleware/validation.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Apply rate limiter to auth routes
router.use(authLimiter)

router.post('/signup', signupValidation, validate, signup)
router.post('/login', loginValidation, validate, login)
router.get('/verify', protect, verifyToken)

export default router
