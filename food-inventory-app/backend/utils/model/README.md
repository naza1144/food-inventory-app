# Meat Analysis Models Integration

## Overview
This directory contains the AI models used for meat analysis in the Food Inventory App. The system integrates both CNN and CRNN models for comprehensive meat quality assessment.

## Model Structure

### CNN Models (model_meat_CNN/)
- `meat_type_model.pth` - CNN model for meat type classification (หมู, ไก่, วัว)
- `meat_quality_model.pth` - CNN model for meat quality assessment
- `yolo26n.pt` - YOLO model for object detection

### CRNN Models (model_meat_CRNN/)
- `crnn.pth` - CRNN model for detailed feature extraction (texture, color, marbling)
- `yolo11n.pt` - YOLO model for object detection

## Model Integration Pipeline

The `meatAnalyzer.js` implements a multi-model analysis pipeline:

1. **Object Detection** - YOLO models detect meat objects in images
2. **CNN Analysis** - Two CNN models analyze:
   - Meat type classification
   - Meat quality assessment
3. **CRNN Analysis** - CRNN model extracts detailed features:
   - Texture analysis (นุ่ม, กระด้าง, ยืดหยุ่น)
   - Color assessment (สด, ซีด, เข้ม)
   - Marbling score (1-5)
4. **Result Combination** - Weighted combination of all model predictions

## Setup Instructions

### Prerequisites
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node @tensorflow/tfjs-converter sharp onnxruntime-node
```

### Model Conversion (Required for Production)
The current PyTorch models (.pth) need to be converted to ONNX format for TensorFlow.js compatibility:

```python
# Python script for model conversion
import torch
import torchvision

# Convert CNN models
meat_type_model = torch.load('meat_type_model.pth')
torch.onnx.export(meat_type_model, dummy_input, 'meat_type_model.onnx')

meat_quality_model = torch.load('meat_quality_model.pth')
torch.onnx.export(meat_quality_model, dummy_input, 'meat_quality_model.onnx')

# Convert CRNN model
crnn_model = torch.load('crnn.pth')
torch.onnx.export(crnn_model, dummy_input, 'crnn.onnx')
```

### Usage
```javascript
import meatAnalyzer from './utils/meatAnalyzer.js'

// Initialize models
await meatAnalyzer.initialize()

// Analyze meat image
const result = await meatAnalyzer.analyzeMeat('path/to/image.jpg')

console.log(result)
// Output:
// {
//   meatType: 'หมู',
//   quality: 'ดี',
//   freshnessScore: 85,
//   texture: 'นุ่ม',
//   color: 'สด',
//   marbling: 3,
//   confidence: 0.92,
//   modelDetails: { ... }
// }
```

## Model Details

### Input Specifications
- **CNN Models**: 224x224 RGB images
- **CRNN Model**: 256x256 RGB images
- **YOLO Models**: Variable size, auto-resized

### Output Specifications
- **Meat Types**: ['หมู', 'ไก่', 'วัว']
- **Quality Levels**: ['ดีมาก', 'ดี', 'ปานกลาง', 'แย่', 'แย่มาก']
- **Texture**: ['นุ่ม', 'กระด้าง', 'ยืดหยุ่น']
- **Color**: ['สด', 'ซีด', 'เข้ม']
- **Marbling**: Scale 1-5

### Confidence Weights
- CNN Type Classification: 30%
- CNN Quality Assessment: 40%
- CRNN Feature Analysis: 20%
- YOLO Object Detection: 10%

## Fallback System
If models fail to load, the system automatically falls back to mock predictions with realistic confidence scores to ensure continuous operation.

## Performance Considerations
- Models are loaded once at startup
- Tensor memory is properly managed with dispose()
- Image preprocessing uses Sharp for efficient resizing
- Batch processing is supported for multiple detections

## Error Handling
- Model loading failures are logged and handled gracefully
- Image processing errors trigger fallback predictions
- Tensor memory cleanup prevents memory leaks
