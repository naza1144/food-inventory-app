import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { AppError } from './errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '../storage/uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `food-${uniqueSuffix}-${file.originalname}`)
  }
})

// File filter
const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new AppError('รองรับเฉพาะไฟล์รูปภาพ', 400), false)
  }
}

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
})

export default upload
