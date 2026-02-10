import sharp from 'sharp'

let tf = null
try {
  tf = require('@tensorflow/tfjs-node')
} catch (error) {
  console.log('⚠️  TensorFlow.js not available, using mock implementation')
}

class ImageProcessor {
  constructor() {
    this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff']
  }

  // Preprocess image for CNN models (224x224)
  async preprocessForCNN(imageBuffer) {
    try {
      // Resize to 224x224 for CNN
      const resizedImage = await sharp(imageBuffer)
        .resize(224, 224)
        .removeAlpha()
        .toBuffer()
      
      // Convert to tensor and normalize
      const imageTensor = tf.node.decodeImage(resizedImage, 3)
      const normalized = imageTensor.toFloat().div(255.0)
      const batched = normalized.expandDims(0)
      
      return batched
    } catch (error) {
      console.error('Error preprocessing image for CNN:', error)
      throw error
    }
  }

  // Preprocess image for CRNN model (256x256)
  async preprocessForCRNN(imageBuffer) {
    try {
      // Resize to appropriate size for CRNN (typically 256x256)
      const resizedImage = await sharp(imageBuffer)
        .resize(256, 256)
        .removeAlpha()
        .toBuffer()
      
      // Convert to tensor and normalize
      const imageTensor = tf.node.decodeImage(resizedImage, 3)
      const normalized = imageTensor.toFloat().div(255.0)
      const batched = normalized.expandDims(0)
      
      return batched
    } catch (error) {
      console.error('Error preprocessing image for CRNN:', error)
      throw error
    }
  }

  // Preprocess image for YOLO models (640x640)
  async preprocessForYOLO(imageTensor) {
    try {
      if (!tf) {
        // Mock implementation when TensorFlow is not available
        return {
          data: new Float32Array(640 * 640 * 3),
          shape: [1, 640, 640, 3],
          dispose: () => {}
        }
      }
      // Resize to YOLO input size (640x640)
      const resized = tf.image.resizeBilinear(imageTensor, [640, 640])
      const normalized = resized.div(255.0)
      const batched = normalized.expandDims(0)
      
      return batched
    } catch (error) {
      console.error('Error preprocessing image for YOLO:', error)
      throw error
    }
  }

  // Decode image from buffer to tensor
  decodeImage(imageBuffer) {
    try {
      if (!tf) {
        // Mock implementation when TensorFlow is not available
        return {
          data: new Float32Array(224 * 224 * 3),
          shape: [224, 224, 3],
          dispose: () => {}
        }
      }
      return tf.node.decodeImage(imageBuffer, 3)
    } catch (error) {
      console.error('Error decoding image:', error)
      throw error
    }
  }

  // Crop image tensor based on bounding box
  cropImageTensor(imageTensor, bbox) {
    try {
      const [x, y, width, height] = bbox
      const croppedTensor = tf.image.cropAndResize(
        imageTensor.expandDims(0),
        [[y / imageTensor.shape[0], x / imageTensor.shape[1], 
          (y + height) / imageTensor.shape[0], (x + width) / imageTensor.shape[1]]],
        [0],
        [224, 224]
      )
      
      return croppedTensor
    } catch (error) {
      console.error('Error cropping image tensor:', error)
      throw error
    }
  }

  // Validate image format
  validateImageFormat(imageBuffer) {
    try {
      const image = sharp(imageBuffer)
      const metadata = image.metadata()
      
      return metadata.then(meta => {
        const format = meta.format.toLowerCase()
        return this.supportedFormats.includes(format)
      })
    } catch (error) {
      console.error('Error validating image format:', error)
      return false
    }
  }

  // Get image metadata
  async getImageMetadata(imageBuffer) {
    try {
      const image = sharp(imageBuffer)
      const metadata = await image.metadata()
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha
      }
    } catch (error) {
      console.error('Error getting image metadata:', error)
      throw error
    }
  }

  // Resize image to specific dimensions
  async resizeImage(imageBuffer, width, height) {
    try {
      return await sharp(imageBuffer)
        .resize(width, height)
        .removeAlpha()
        .toBuffer()
    } catch (error) {
      console.error('Error resizing image:', error)
      throw error
    }
  }

  // Clean up tensor memory
  disposeTensor(tensor) {
    if (tensor && typeof tensor.dispose === 'function') {
      tensor.dispose()
    }
  }

  // Batch dispose multiple tensors
  disposeTensors(tensors) {
    tensors.forEach(tensor => this.disposeTensor(tensor))
  }
}

// Export singleton instance
const imageProcessor = new ImageProcessor()
export default imageProcessor
