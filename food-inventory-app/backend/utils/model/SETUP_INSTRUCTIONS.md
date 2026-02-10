# Meat Analysis Models Setup Instructions

## Overview
This document provides step-by-step instructions for setting up the meat analysis models with the updated sequential pipeline that checks for expiration labels first using CRNN YOLO, then proceeds with CNN analysis.

## Prerequisites

### Node.js Dependencies
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node @tensorflow/tfjs-converter sharp onnxruntime-node
```

### Python Dependencies (for model conversion)
```bash
pip install torch torchvision onnx
```

## Model Pipeline Architecture

### Sequential Analysis Flow
1. **Expiration Label Detection** (CRNN YOLO)
   - Uses `yolo11n.pt` model
   - Checks for expiration labels in the image
   - If found, returns immediate result with expiration status

2. **Meat Object Detection** (CNN YOLO)
   - Uses `yolo26n.pt` model
   - Detects meat objects when no expiration labels are found

3. **CNN Analysis**
   - **Meat Type Classification**: `meat_type_model.pth` → หมู, ไก่, วัว
   - **Quality Assessment**: `meat_quality_model.pth` → 5 quality levels + freshness score

## Model Conversion (Required for Production)

### Step 1: Convert PyTorch Models to ONNX
Run the conversion script:
```bash
cd utils/model
python convert_models.py
```

### Step 2: Verify ONNX Models
Ensure the following ONNX files are created:
- `model_meat_CNN/meat_type_model.onnx`
- `model_meat_CNN/meat_quality_model.onnx`
- `model_meat_CNN/yolo26n.onnx`
- `model_meat_CRNN/crnn.onnx`
- `model_meat_CRNN/yolo11n.onnx`

## Usage Examples

### Initialize the Analyzer
```javascript
import meatAnalyzer from './utils/meatAnalyzer.js'

// Initialize models
const success = await meatAnalyzer.initialize()
if (!success) {
  console.error('Failed to initialize models')
  return
}
```

### Analyze Meat Image
```javascript
// Analyze image
const result = await meatAnalyzer.analyzeMeat('path/to/meat/image.jpg')

if (result.hasExpirationLabel) {
  console.log('Expiration label detected:', result.labelDetections)
  console.log('Status:', result.status)
} else {
  console.log('Meat Type:', result.meatType)
  console.log('Quality:', result.quality)
  console.log('Freshness Score:', result.freshnessScore)
  console.log('Confidence:', result.confidence)
}
```

## Model Output Formats

### Expiration Label Detection
```javascript
{
  hasExpirationLabel: true,
  labelDetections: [
    {
      bbox: [x, y, w, h],
      confidence: 0.95,
      class: 'expiration_label'
    }
  ],
  status: 'expired_detected',
  message: 'Expiration label detected in image'
}
```

### CNN Analysis Result
```javascript
{
  meatType: 'หมู',
  quality: 'ดี',
  freshnessScore: 85,
  confidence: 0.92,
  hasExpirationLabel: false,
  analysisType: 'cnn_only',
  modelDetails: {
    cnn: {
      typeConfidence: 0.89,
      qualityConfidence: 0.94
    },
    detection: {
      confidence: 0.95
    }
  }
}
```

## Error Handling

### Model Loading Errors
- Models that fail to load will log error messages
- System will continue with mock predictions until ONNX models are available
- Initialize function returns `false` if critical models fail to load

### Analysis Errors
- Image processing errors throw exceptions
- No meat objects detected throws error
- Model inference errors are logged and re-thrown

## Performance Considerations

### Memory Management
- Tensors are properly disposed after use
- Batch processing supported for multiple detections
- Model sessions are cached after initialization

### Processing Pipeline
- Sequential processing ensures expiration labels are checked first
- Early termination when expiration labels are found
- Efficient image preprocessing with Sharp library

## Troubleshooting

### Common Issues

1. **Models not loading**
   - Check if model files exist in correct directories
   - Verify ONNX models are converted from PyTorch
   - Check file permissions

2. **Memory leaks**
   - Ensure tensor.dispose() is called after processing
   - Monitor Node.js memory usage during batch processing

3. **Poor detection results**
   - Verify image preprocessing parameters
   - Check model input/output formats
   - Validate confidence thresholds

### Debug Mode
Enable detailed logging:
```javascript
// Set environment variable
process.env.DEBUG = 'meat-analyzer'

// Or modify the code to add more console.log statements
```

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
MODEL_PATH=/path/to/models
TENSORFLOW_BACKEND=tensorflow
```

### Monitoring
- Monitor model loading times
- Track analysis success rates
- Log confidence score distributions
- Monitor memory usage patterns

## Next Steps

1. **Convert Models**: Run the Python conversion script
2. **Test Pipeline**: Test with sample meat images
3. **Validate Results**: Verify output formats and confidence scores
4. **Performance Testing**: Test with batch processing
5. **Deploy**: Deploy to production environment

## Support

For issues with:
- **Model Conversion**: Check Python script output
- **Model Loading**: Verify file paths and permissions
- **Analysis Results**: Check image preprocessing and model outputs
- **Performance**: Monitor memory and processing times
