import Food from '../models/Food.js'
import meatAnalyzer from '../utils/meatAnalyzer.js'
import { AppError } from '../middleware/errorHandler.js'

// Initialize meat analyzer when module loads
let analyzerInitialized = false

const ensureAnalyzerInitialized = async () => {
  if (!analyzerInitialized) {
    console.log('🔧 Initializing Meat Analyzer...')
    await meatAnalyzer.initialize()
    analyzerInitialized = true
    console.log('✅ Meat Analyzer initialized successfully')
  }
}

export const scanFood = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('กรุณาอัพโหลดรูปภาพ', 400))
    }

    const { purchase_date, storage_method } = req.body

    if (!purchase_date || !storage_method) {
      return next(new AppError('กรุณากรอกข้อมูลให้ครบถ้วน', 400))
    }

    // Ensure meat analyzer is initialized
    await ensureAnalyzerInitialized()

    // Try to analyze image with AI, but provide defaults if analysis fails
    let analysis = {
      meatType: 'ไม่ระบุ',
      freshnessScore: 100,
      confidence: 0
    }

    try {
      analysis = await meatAnalyzer.analyzeMeat(req.file.path)
    } catch (error) {
      console.log('⚠️ AI analysis failed, using default values:', error.message)
      // Continue with default values instead of aborting
    }

    // Calculate adjusted freshness score based on date and storage
    const adjustedFreshness = meatAnalyzer.calculateFreshnessAdjustment(
      purchase_date,
      storage_method,
      analysis.freshnessScore
    )

    // Prepare result
    const result = {
      image_url: `http://localhost:5000/uploads/${req.file.filename}`,
      meat_type: analysis.meatType,
      purchase_date,
      storage_method,
      freshness_score: adjustedFreshness,
      confidence: analysis.confidence
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const saveFood = async (req, res, next) => {
  try {
    const { meat_type, purchase_date, storage_method, freshness_score } = req.body
    
    // Debug: แสดงข้อมูลที่ได้รับ
    console.log('req.file:', req.file)
    console.log('req.body:', req.body)
    
    // รับ image_url จาก file upload หรือจาก body
    let image_url
    if (req.file) {
      image_url = `http://localhost:5000/uploads/${req.file.filename}`
    } else if (req.body.image_url) {
      image_url = req.body.image_url
    }

    // ต้องมีอย่างน้อย image_url
    if (!image_url) {
      return next(new AppError('กรุณาอัพโหลดรูปภาพ', 400))
    }

    // คำนวณ freshness score ถ้าไม่ได้ส่งมา
    let calculatedFreshness = 100
    if (purchase_date) {
      const purchaseDateObj = new Date(purchase_date)
      const today = new Date()
      const daysOld = Math.floor((today - purchaseDateObj) / (1000 * 60 * 60 * 24))
      
      // ปรับตามวันที่และวิธีการเก็บ
      if (storage_method === 'ตู้เย็น') {
        calculatedFreshness = Math.max(0, 100 - (daysOld * 3)) // ลดลง 3% ต่อวัน
      } else if (storage_method === 'ที่อุณหภูมิห้อง') {
        calculatedFreshness = Math.max(0, 100 - (daysOld * 8)) // ลดลง 8% ต่อวัน
      } else {
        calculatedFreshness = Math.max(0, 100 - (daysOld * 5)) // ลดลง 5% ต่อวัน
      }
    }

    const food = await Food.create({
      userId: req.user.id,
      imageUrl: image_url,
      meatType: meat_type || 'ไม่ระบุ',
      purchaseDate: purchase_date || new Date().toISOString().split('T')[0],
      storageMethod: storage_method || 'ตู้เย็น',
      freshnessScore: (freshness_score !== null && freshness_score !== undefined && !isNaN(freshness_score)) ? parseInt(freshness_score) : calculatedFreshness
    })

    // แปลงข้อมูลให้ frontend อ่านได้
    const responseFood = {
      id: food.id,
      imageUrl: food.image_url,
      meatType: food.meat_type,
      purchaseDate: food.purchase_date,
      storageMethod: food.storage_method,
      freshnessScore: food.freshness_score,
      created_at: food.created_at
    }

    res.status(201).json({
      success: true,
      data: responseFood
    })
  } catch (error) {
    next(error)
  }
}

export const getAllFoods = async (req, res, next) => {
  try {
    const foods = await Food.findByUserId(req.user.id)
    
    // แปลงข้อมูลให้ frontend อ่านได้
    const responseFoods = foods.map(food => ({
      id: food.id,
      imageUrl: food.image_url,
      meatType: food.meat_type,
      purchaseDate: food.purchase_date,
      storageMethod: food.storage_method,
      freshnessScore: food.freshness_score,
      created_at: food.created_at
    }))

    res.json({
      success: true,
      count: responseFoods.length,
      data: responseFoods
    })
  } catch (error) {
    next(error)
  }
}

export const getRecentFoods = async (req, res, next) => {
  try {
    const foods = await Food.findRecentByUserId(req.user.id, 5)
    
    // แปลงข้อมูลให้ frontend อ่านได้
    const responseFoods = foods.map(food => ({
      id: food.id,
      imageUrl: food.image_url,
      meatType: food.meat_type,
      purchaseDate: food.purchase_date,
      storageMethod: food.storage_method,
      freshnessScore: food.freshness_score,
      created_at: food.created_at
    }))

    res.json({
      success: true,
      data: responseFoods
    })
  } catch (error) {
    next(error)
  }
}

export const getStats = async (req, res, next) => {
  try {
    const stats = await Food.getStats(req.user.id)

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total) || 0,
        expiringSoon: parseInt(stats.expiring_soon) || 0,
        fresh: parseInt(stats.fresh) || 0,
        spoiled: parseInt(stats.spoiled) || 0
      }
    })
  } catch (error) {
    next(error)
  }
}

export const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params

    const food = await Food.findById(id, req.user.id)
    if (!food) {
      return next(new AppError('ไม่พบข้อมูลอาหาร', 404))
    }

    await Food.delete(id, req.user.id)

    res.json({
      success: true,
      message: 'ลบข้อมูลสำเร็จ'
    })
  } catch (error) {
    next(error)
  }
}
