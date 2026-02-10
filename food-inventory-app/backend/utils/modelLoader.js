import path from 'path'

class ModelLoader {
  constructor() {
    this.models = {}
    this.ort = null
  }

  async initialize() {
    try {
      this.ort = require('onnxruntime-node')
      console.log('🔧 Model Loader initialized')
      return true
    } catch (error) {
      console.log('⚠️  ONNX Runtime not available, using mock implementation')
      this.ort = this.createMockORT()
      return true
    }
  }

  createMockORT() {
    const self = this
    return {
      Tensor: class MockTensor {
        constructor(type, data, dims) {
          this.type = type
          this.data = data
          this.dims = dims
        }
      },
      InferenceSession: {
        create: async (modelPath) => {
          console.log(`Creating mock session for: ${modelPath}`)
          return self.createMockSession(modelPath)
        }
      }
    }
  }

  async loadModel(modelPath, modelName) {
    try {
      if (this.models[modelName]) {
        return this.models[modelName]
      }

      console.log(`Loading model: ${modelPath}`)
      
      // Check if ONNX version exists, otherwise try to load PyTorch
      const onnxPath = modelPath.replace('.pth', '.onnx').replace('.pt', '.onnx')
      
      try {
        // Try to load ONNX version first
        const session = await this.ort.InferenceSession.create(onnxPath)
        console.log(`✅ Loaded ONNX model: ${onnxPath}`)
        this.models[modelName] = session
        return session
      } catch (onnxError) {
        console.log(`⚠️  ONNX model not found: ${onnxPath}`)
        console.log(`🔄 Creating mock session for PyTorch model: ${modelPath}`)
        
        // Create mock session for PyTorch models (until converted)
        const mockSession = this.createMockSession(modelPath)
        this.models[modelName] = mockSession
        return mockSession
      }
    } catch (error) {
      console.error(`Error loading model ${modelPath}:`, error)
      throw new Error(`Failed to load model: ${modelPath}`)
    }
  }

  createMockSession(modelPath) {
    const ort = this.ort
    return {
      run: async (feeds) => {
        // Mock inference based on model type
        const input = feeds.input
        const batchSize = input.dims ? input.dims[0] : 1 // Default to 1 if dims undefined
        
        let outputTensor
        
        if (modelPath.includes('meat_type_model')) {
          // Meat type classification: 3 classes (หมู, ไก่, วัว)
          const outputData = new Float32Array(batchSize * 3)
          for (let i = 0; i < batchSize; i++) {
            const baseIdx = i * 3
            // Create realistic probability distribution
            const probs = this.generateRandomProbs(3)
            outputData[baseIdx] = probs[0]
            outputData[baseIdx + 1] = probs[1]
            outputData[baseIdx + 2] = probs[2]
          }
          outputTensor = new ort.Tensor('float32', outputData, [batchSize, 3])
          
        } else if (modelPath.includes('meat_quality_model')) {
          // Quality assessment: 5 quality levels + 1 freshness score
          const outputData = new Float32Array(batchSize * 6)
          for (let i = 0; i < batchSize; i++) {
            const baseIdx = i * 6
            const qualityProbs = this.generateRandomProbs(5)
            for (let j = 0; j < 5; j++) {
              outputData[baseIdx + j] = qualityProbs[j]
            }
            outputData[baseIdx + 5] = Math.random() // Freshness score 0-1
          }
          outputTensor = new ort.Tensor('float32', outputData, [batchSize, 6])
          
        } else if (modelPath.includes('yolo')) {
          // YOLO detection: [x, y, w, h, confidence, class_id] format
          const numDetections = 10 // Mock 10 detections
          const outputData = new Float32Array(batchSize * numDetections * 6)
          for (let i = 0; i < batchSize; i++) {
            for (let j = 0; j < numDetections; j++) {
              const baseIdx = (i * numDetections + j) * 6
              outputData[baseIdx] = Math.random() * 640 // x
              outputData[baseIdx + 1] = Math.random() * 640 // y
              outputData[baseIdx + 2] = Math.random() * 200 + 50 // w
              outputData[baseIdx + 3] = Math.random() * 200 + 50 // h
              outputData[baseIdx + 4] = Math.random() * 0.5 + 0.5 // confidence
              outputData[baseIdx + 5] = Math.floor(Math.random() * 3) // class_id
            }
          }
          outputTensor = new ort.Tensor('float32', outputData, [batchSize, numDetections, 6])
          
        } else {
          // Default case
          const outputData = new Float32Array(batchSize * 3)
          outputData.fill(0.33)
          outputTensor = new ort.Tensor('float32', outputData, [batchSize, 3])
        }
        
        // Return in the format expected by YOLO detectors
        return { output: outputTensor }
      }
    }
  }

  // Generate random probability distribution that sums to 1
  generateRandomProbs(numClasses) {
    const probs = []
    let sum = 0
    
    // Generate random values
    for (let i = 0; i < numClasses; i++) {
      probs.push(Math.random())
      sum += probs[i]
    }
    
    // Normalize to sum to 1
    for (let i = 0; i < numClasses; i++) {
      probs[i] = probs[i] / sum
    }
    
    return probs
  }

  getModel(modelName) {
    return this.models[modelName] || null
  }

  clearModels() {
    this.models = {}
    console.log('🧹 Cleared all loaded models')
  }
}

// Export singleton instance
const modelLoader = new ModelLoader()
export default modelLoader
