import { body, validationResult } from 'express-validator'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

export const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('กรุณากรอกชื่อ')
    .isLength({ min: 2 })
    .withMessage('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('กรุณากรอกอีเมล')
    .isEmail()
    .withMessage('รูปแบบอีเมลไม่ถูกต้อง')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('กรุณากรอกรหัสผ่าน')
    .isLength({ min: 6 })
    .withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
]

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('กรุณากรอกอีเมล')
    .isEmail()
    .withMessage('รูปแบบอีเมลไม่ถูกต้อง')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('กรุณากรอกรหัสผ่าน')
]
