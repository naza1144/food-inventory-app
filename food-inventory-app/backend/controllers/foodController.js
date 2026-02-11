import Food from '../models/Food.js'
import MeatService from "../services/meat.service.js";
import { AppError } from '../middleware/errorHandler.js'

export const scanFood = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('กรุณาอัพโหลดรูปภาพ', 400))
    }

    const { purchase_date, storage_method } = req.body

    if (!purchase_date || !storage_method) {
      return next(new AppError('กรุณากรอกข้อมูลให้ครบถ้วน', 400))
    }

    // Analyze image with AI using MeatService
    const analysis = await MeatService.analyze(req.file.path)

    // Prepare result
    const result = {
      image_url: `/uploads/${req.file.filename}`,
      meat_type: analysis.meatType || 'ไม่ระบุ',
      purchase_date,
      storage_method,
      freshness_score: analysis.freshness?.percentage || 85,
      confidence: analysis.confidence || 0.8,
      has_label: analysis.hasLabel || false,
      analysis_type: analysis.analysisType || 'mock'
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
      image_url = `/uploads/${req.file.filename}`
    } else if (req.body.image_url) {
      image_url = req.body.image_url
    }

    // ต้องมีอย่างน้อย image_url
    if (!image_url) {
      return next(new AppError('กรุณาอัพโหลดรูปภาพ', 400))
    }

    const food = await Food.create({
      userId: req.user.id,
      imageUrl: image_url,
      meatType: meat_type || 'ไม่ระบุ',
      purchaseDate: purchase_date || new Date().toISOString().split('T')[0],
      storageMethod: storage_method || 'ไม่ระบุ',
      freshnessScore: freshness_score !== undefined ? freshness_score : 0
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
