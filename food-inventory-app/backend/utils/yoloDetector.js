import imageProcessor from './imageProcessor.js'

class YOLODetector {
  constructor(modelLoader) {
    this.modelLoader = modelLoader
    this.confidenceThreshold = 0.5
    this.nmsThreshold = 0.4
  }

  // Detect expiration labels using CRNN YOLO model
  async detectExpirationLabels(imageBuffer) {
    try {
      const yoloCRNNModel = this.modelLoader.getModel('yoloCRNN')
      if (!yoloCRNNModel) {
        throw new Error('CRNN YOLO model not loaded')
      }

      // Decode and preprocess image for YOLO
      const imageTensor = imageProcessor.decodeImage(imageBuffer)
      const preprocessedTensor = await imageProcessor.preprocessForYOLO(imageTensor)

      // Run YOLO detection for expiration labels
      const feeds = { input: preprocessedTensor }
      const results = await yoloCRNNModel.run(feeds)
      
      // Process YOLO output to find expiration labels
      const detections = this.processYOLOOutput(results.output, 'expiration_label')
      
      // Clean up tensors
      imageProcessor.disposeTensors([imageTensor, preprocessedTensor])
      
      return detections
    } catch (error) {
      console.error('Error detecting expiration labels:', error)
      return [] // Return empty array if detection fails
    }
  }

  // Detect meat objects using CNN YOLO model
  async detectMeatObjects(imageTensor) {
    try {
      const yoloModel = this.modelLoader.getModel('yoloCNN')
      if (!yoloModel) {
        throw new Error('CNN YOLO model not loaded')
      }

      // Preprocess image for YOLO
      const preprocessedTensor = await imageProcessor.preprocessForYOLO(imageTensor)

      // Run YOLO detection for meat objects
      const feeds = { input: preprocessedTensor }
      const results = await yoloModel.run(feeds)
      
      // Process YOLO output to find meat objects
      const detections = this.processYOLOOutput(results.output, 'meat')
      
      // Clean up tensors
      imageProcessor.disposeTensor(preprocessedTensor)
      
      return detections
    } catch (error) {
      console.error('Error detecting meat objects:', error)
      return [] // Return empty array if detection fails
    }
  }

  // Process YOLO output to extract detections
  processYOLOOutput(output, targetType) {
    try {
      const detections = []
      
      // Check if output exists and has data
      if (!output || !output.data || !output.dims) {
        console.log('⚠️  Invalid YOLO output, returning empty detections')
        return detections
      }
      
      const data = output.data
      const shape = output.dims
      
      // Parse YOLO output format
      if (shape.length === 3) {
        // Format: [batch, num_detections, 6] where 6 = [x, y, w, h, confidence, class_id]
        const batchSize = shape[0]
        const numDetections = shape[1]
        
        for (let batch = 0; batch < batchSize; batch++) {
          for (let i = 0; i < numDetections; i++) {
            const baseIdx = (batch * numDetections + i) * 6
            const [x, y, w, h, confidence, classId] = [
              data[baseIdx],
              data[baseIdx + 1],
              data[baseIdx + 2],
              data[baseIdx + 3],
              data[baseIdx + 4],
              data[baseIdx + 5]
            ]
            
            if (confidence > this.confidenceThreshold) {
              if (targetType === 'expiration_label' && classId === 0) {
                detections.push({
                  bbox: [x, y, w, h],
                  confidence: confidence,
                  class: 'expiration_label'
                })
              } else if (targetType === 'meat' && (classId === 0 || classId === 1 || classId === 2)) {
                detections.push({
                  bbox: [x, y, w, h],
                  confidence: confidence,
                  class: 'meat'
                })
              }
            }
          }
        }
      } else if (shape.length === 2) {
        // Alternative format: [num_detections, 6]
        const numDetections = shape[0]
        
        for (let i = 0; i < numDetections; i++) {
          const baseIdx = i * 6
          const [x, y, w, h, confidence, classId] = [
            data[baseIdx],
            data[baseIdx + 1],
            data[baseIdx + 2],
            data[baseIdx + 3],
            data[baseIdx + 4],
            data[baseIdx + 5]
          ]
          
          if (confidence > this.confidenceThreshold) {
            if (targetType === 'expiration_label' && classId === 0) {
              detections.push({
                bbox: [x, y, w, h],
                confidence: confidence,
                class: 'expiration_label'
              })
            } else if (targetType === 'meat' && (classId === 0 || classId === 1 || classId === 2)) {
              detections.push({
                bbox: [x, y, w, h],
                confidence: confidence,
                class: 'meat',
                classId: classId
              })
            }
          }
        }
      }
      
      // Apply Non-Maximum Suppression (NMS) to remove duplicate detections
      return this.applyNMS(detections)
    } catch (error) {
      console.error('Error processing YOLO output:', error)
      return []
    }
  }

  // Apply Non-Maximum Suppression to remove overlapping detections
  applyNMS(detections) {
    try {
      if (detections.length === 0) return detections
      
      // Sort by confidence (highest first)
      const sortedDetections = detections.sort((a, b) => b.confidence - a.confidence)
      const suppressed = new Array(sortedDetections.length).fill(false)
      const finalDetections = []
      
      for (let i = 0; i < sortedDetections.length; i++) {
        if (suppressed[i]) continue
        
        finalDetections.push(sortedDetections[i])
        
        // Suppress overlapping detections
        for (let j = i + 1; j < sortedDetections.length; j++) {
          if (suppressed[j]) continue
          
          const iou = this.calculateIoU(sortedDetections[i].bbox, sortedDetections[j].bbox)
          if (iou > this.nmsThreshold) {
            suppressed[j] = true
          }
        }
      }
      
      return finalDetections
    } catch (error) {
      console.error('Error applying NMS:', error)
      return detections
    }
  }

  // Calculate Intersection over Union (IoU) for two bounding boxes
  calculateIoU(bbox1, bbox2) {
    const [x1, y1, w1, h1] = bbox1
    const [x2, y2, w2, h2] = bbox2
    
    // Calculate intersection
    const xLeft = Math.max(x1, x2)
    const yTop = Math.max(y1, y2)
    const xRight = Math.min(x1 + w1, x2 + w2)
    const yBottom = Math.min(y1 + h1, y2 + h2)
    
    if (xRight < xLeft || yBottom < yTop) return 0
    
    const intersectionArea = (xRight - xLeft) * (yBottom - yTop)
    
    // Calculate union
    const area1 = w1 * h1
    const area2 = w2 * h2
    const unionArea = area1 + area2 - intersectionArea
    
    return intersectionArea / unionArea
  }

  // Set confidence threshold
  setConfidenceThreshold(threshold) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold))
  }

  // Set NMS threshold
  setNMSThreshold(threshold) {
    this.nmsThreshold = Math.max(0, Math.min(1, threshold))
  }

  // Get current thresholds
  getThresholds() {
    return {
      confidence: this.confidenceThreshold,
      nms: this.nmsThreshold
    }
  }
}

export default YOLODetector
