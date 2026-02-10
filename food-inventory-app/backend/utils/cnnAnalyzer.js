import imageProcessor from './imageProcessor.js'

class CNNAnalyzer {
  constructor(modelLoader) {
    this.modelLoader = modelLoader
    this.meatTypes = ['หมู', 'ไก่', 'วัว']
    this.qualityLevels = ['ดีมาก', 'ดี', 'ปานกลาง', 'แย่', 'แย่มาก']
  }

  // CNN meat type analysis
  async analyzeMeatType(imageTensor) {
    try {
      const cnnModel = this.modelLoader.getModel('meatType')
      if (!cnnModel) {
        throw new Error('CNN meat type model not loaded')
      }

      // Run CNN model for meat type classification
      const feeds = { input: imageTensor }
      const results = await cnnModel.run(feeds)
      
      // Process CNN output to get meat type prediction
      const prediction = this.processTypeOutput(results.output)
      
      return prediction
    } catch (error) {
      console.error('Error in CNN meat type analysis:', error)
      throw error
    }
  }

  // CNN meat quality analysis
  async analyzeMeatQuality(imageTensor) {
    try {
      const cnnModel = this.modelLoader.getModel('meatQuality')
      if (!cnnModel) {
        throw new Error('CNN meat quality model not loaded')
      }

      // Run CNN model for meat quality assessment
      const feeds = { input: imageTensor }
      const results = await cnnModel.run(feeds)
      
      // Process CNN output to get quality prediction
      const prediction = this.processQualityOutput(results.output)
      
      return prediction
    } catch (error) {
      console.error('Error in CNN meat quality analysis:', error)
      throw error
    }
  }

  // Process CNN output for meat type classification
  processTypeOutput(output) {
    try {
      const probabilities = output.data
      let maxProb = 0
      let predictedClass = 0
      
      // Find the class with highest probability
      for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > maxProb) {
          maxProb = probabilities[i]
          predictedClass = i
        }
      }
      
      return {
        prediction: this.meatTypes[predictedClass],
        confidence: maxProb
      }
    } catch (error) {
      console.error('Error processing CNN type output:', error)
      throw error
    }
  }

  // Process CNN output for meat quality assessment
  processQualityOutput(output) {
    try {
      const probabilities = output.data
      
      // Get quality level prediction (first part of output)
      let maxProb = 0
      let predictedQualityIndex = 0
      
      for (let i = 0; i < this.qualityLevels.length; i++) {
        if (probabilities[i] > maxProb) {
          maxProb = probabilities[i]
          predictedQualityIndex = i
        }
      }
      
      // Get freshness score (second part of output)
      const freshnessScore = Math.round(probabilities[this.qualityLevels.length] * 100)
      
      return {
        quality: this.qualityLevels[predictedQualityIndex],
        freshnessScore: Math.min(Math.max(freshnessScore, 0), 100),
        confidence: maxProb
      }
    } catch (error) {
      console.error('Error processing CNN quality output:', error)
      throw error
    }
  }

  // Combine CNN predictions
  combinePredictions(typeResult, qualityResult, detectionConfidence) {
    const weights = {
      type: 0.4,
      quality: 0.4,
      detection: 0.2
    }
    
    const combinedConfidence = (
      typeResult.confidence * weights.type +
      qualityResult.confidence * weights.quality +
      detectionConfidence * weights.detection
    )
    
    return {
      meatType: typeResult.prediction,
      quality: qualityResult.quality,
      freshnessScore: qualityResult.freshnessScore,
      confidence: Math.min(combinedConfidence, 1.0),
      modelDetails: {
        cnn: {
          typeConfidence: typeResult.confidence,
          qualityConfidence: qualityResult.confidence
        },
        detection: {
          confidence: detectionConfidence
        }
      }
    }
  }
}

export default CNNAnalyzer
