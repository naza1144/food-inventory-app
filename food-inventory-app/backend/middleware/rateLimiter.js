import rateLimit from 'express-rate-limit'

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'คำขอมากเกินไป กรุณาลองใหม่ภายหลัง',
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased for testing)
  message: 'พยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ใน 15 นาที',
  standardHeaders: true,
  legacyHeaders: false,
})

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 uploads per hour
  message: 'อัพโหลดมากเกินไป กรุณาลองใหม่ภายหลัง',
  standardHeaders: true,
  legacyHeaders: false,
})
