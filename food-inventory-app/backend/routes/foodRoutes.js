import express from 'express'
import {
  scanFood,
  saveFood,
  getAllFoods,
  getRecentFoods,
  getStats,
  deleteFood
} from '../controllers/foodController.js'
import { protect } from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { uploadLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

// Scan food (with image upload)
router.post('/scan', uploadLimiter, upload.single('image'), scanFood)

// Save food to database
router.post('/', saveFood)

// Save image only (without analysis)
router.post('/save-image', uploadLimiter, upload.single('image'), saveFood)

// Get all foods
router.get('/', getAllFoods)

// Get recent foods
router.get('/recent', getRecentFoods)

// Get statistics
router.get('/stats', getStats)

// Delete food
router.delete('/:id', deleteFood)

export default router
