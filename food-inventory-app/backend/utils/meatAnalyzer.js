import { readFileSync } from 'fs'
import path from 'path'
import modelLoader from './modelLoader.js'
import imageProcessor from './imageProcessor.js'
import YOLODetector from './yoloDetector.js'
import CNNAnalyzer from './cnnAnalyzer.js'

class MeatAnalyzer {
  constructor() {
    this.modelLoader = modelLoader
    this.imageProcessor = imageProcessor
    this.yoloDetector = new YOLODetector(modelLoader)
    this.cnnAnalyzer = new CNNAnalyzer(modelLoader)
    this.modelLoaded = false
  }

  // Initialize models with proper error handling
  async initialize() {
    try {
      console.log('🤖 Initializing AI Models...')
      
      // Initialize model loader
      const loaderInitialized = await this.modelLoader.initialize()
      if (!loaderInitialized) {
        throw new Error('Failed to initialize model loader')
      }
      
      // Load all models
      console.log('Loading CNN meat type model...')
      await this.modelLoader.loadModel(
        path.join(process.cwd(), 'utils', 'model', 'model_meat_CNN', 'meat_type_model.pth'),
        'meatType'
      )
      
      console.log('Loading CNN meat quality model...')
      await this.modelLoader.loadModel(
        path.join(process.cwd(), 'utils', 'model', 'model_meat_CNN', 'meat_quality_model.pth'),
        'meatQuality'
      )
      
      console.log('Loading CNN YOLO model...')
      await this.modelLoader.loadModel(
        path.join(process.cwd(), 'utils', 'model', 'model_meat_CNN', 'best.pt'),
        'yoloCNN'
      )
      
      console.log('Loading CRNN YOLO model...')
      await this.modelLoader.loadModel(
        path.join(process.cwd(), 'utils', 'model', 'model_meat_CRNN', 'yolo11n.pt'),
        'yoloCRNN'
      )
      
      // Validate all models loaded successfully
      const requiredModels = ['meatType', 'meatQuality', 'yoloCNN', 'yoloCRNN']
      const missingModels = requiredModels.filter(name => !this.modelLoader.getModel(name))
      
      if (missingModels.length > 0) {
        throw new Error(`Failed to load models: ${missingModels.join(', ')}`)
      }
      
      this.modelLoaded = true
      console.log('✅ All AI Models initialized successfully')
      return true
    } catch (error) {
      console.error('❌ Error initializing models:', error.message)
      console.log('⚠️  Model initialization failed - analysis will not be available')
      this.modelLoaded = false
      return false
    }
  }

  // Main analysis function - sequential pipeline without random predictions
  async analyzeMeat(imagePath) {
    try {
      if (!this.modelLoaded) {
        throw new Error('Models not loaded. Please initialize the analyzer first.')
      }

      // Read image
      const imageBuffer = readFileSync(imagePath)
      
      // Step 1: Check for expiration labels using CRNN YOLO
      console.log('Step 1: Checking for expiration labels...')
      const expirationLabels = await this.yoloDetector.detectExpirationLabels(imageBuffer)
      
      if (expirationLabels.length > 0) {
        console.log(`Found ${expirationLabels.length} expiration label(s)`)
        return {
          hasExpirationLabel: true,
          labelDetections: expirationLabels,
          status: 'expired_detected',
          message: 'Expiration label detected in image'
        }
      }
      
      // Step 2: No expiration labels found, proceed with CNN analysis
      console.log('Step 2: No expiration labels found, proceeding with CNN analysis...')
      
      // Detect meat objects using CNN YOLO
      const fullImageTensor = this.imageProcessor.decodeImage(imageBuffer)
      const meatDetections = await this.yoloDetector.detectMeatObjects(fullImageTensor)
      
      if (meatDetections.length === 0) {
        throw new Error('No meat objects detected in image')
      }

      // Analyze each detected meat object with CNN models
      const results = []
      
      for (const detection of meatDetections) {
        // Crop the detected meat region
        const croppedTensor = this.imageProcessor.cropImageTensor(fullImageTensor, detection.bbox)

        // CNN Analysis for meat type
        const typeResult = await this.cnnAnalyzer.analyzeMeatType(croppedTensor)
        
        // CNN Analysis for meat quality
        const qualityResult = await this.cnnAnalyzer.analyzeMeatQuality(croppedTensor)
        
        // Combine CNN results
        const combinedResult = this.cnnAnalyzer.combinePredictions(
          typeResult,
          qualityResult,
          detection.confidence
        )
        
        results.push(combinedResult)
        
        // Clean up tensors
        this.imageProcessor.disposeTensor(croppedTensor)
      }
      
      // Clean up
      this.imageProcessor.disposeTensor(fullImageTensor)
      
      // Return the best result (highest confidence)
      const bestResult = results.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      )
      
      return {
        ...bestResult,
        hasExpirationLabel: false,
        analysisType: 'cnn_only'
      }
      
    } catch (error) {
      console.error('Error analyzing meat:', error)
      throw error // Don't fallback to mock, throw the error instead
    }
  }

  // คำนวณความสดตามวันที่และวิธีเก็บ
  calculateFreshnessAdjustment(purchaseDate, storageMethod, baseFreshness) {
    const daysSincePurchase = Math.floor(
      (new Date() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24)
    )

    let adjustment = 0

    if (storageMethod === 'ตู้เย็น') {
      // ความสดลดลง 5% ต่อวัน
      adjustment = Math.min(daysSincePurchase * 5, 50)
    } else if (storageMethod === 'ช่องแข็ง') {
      // ความสดลดลง 2% ต่อวัน
      adjustment = Math.min(daysSincePurchase * 2, 30)
    }

    const finalScore = Math.max(baseFreshness - adjustment, 0)
    return Math.floor(finalScore)
  }
}

// Export singleton instance
const meatAnalyzer = new MeatAnalyzer()
export default meatAnalyzer
