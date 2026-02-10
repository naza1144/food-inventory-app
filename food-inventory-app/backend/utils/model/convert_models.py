#!/usr/bin/env python3
"""
Model Conversion Script
Convert PyTorch models (.pth) to ONNX format for TensorFlow.js compatibility
"""

import torch
import torchvision.transforms as transforms
from pathlib import Path
import sys

def convert_cnn_meat_type_model():
    """Convert CNN meat type classification model to ONNX"""
    try:
        # Load the PyTorch model
        model_path = "model_meat_CNN/meat_type_model.pth"
        print(f"Loading CNN meat type model from {model_path}")
        
        # Create dummy input (batch_size=1, channels=3, height=224, width=224)
        dummy_input = torch.randn(1, 3, 224, 224)
        
        # Load model (adjust based on your actual model architecture)
        model = torch.load(model_path, map_location='cpu')
        model.eval()
        
        # Export to ONNX
        onnx_path = "model_meat_CNN/meat_type_model.onnx"
        torch.onnx.export(
            model,
            dummy_input,
            onnx_path,
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={
                'input': {0: 'batch_size'},
                'output': {0: 'batch_size'}
            }
        )
        
        print(f"✅ CNN meat type model converted to {onnx_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error converting CNN meat type model: {e}")
        return False

def convert_cnn_meat_quality_model():
    """Convert CNN meat quality model to ONNX"""
    try:
        model_path = "model_meat_CNN/meat_quality_model.pth"
        print(f"Loading CNN meat quality model from {model_path}")
        
        # Create dummy input
        dummy_input = torch.randn(1, 3, 224, 224)
        
        # Load model
        model = torch.load(model_path, map_location='cpu')
        model.eval()
        
        # Export to ONNX
        onnx_path = "model_meat_CNN/meat_quality_model.onnx"
        torch.onnx.export(
            model,
            dummy_input,
            onnx_path,
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={
                'input': {0: 'batch_size'},
                'output': {0: 'batch_size'}
            }
        )
        
        print(f"✅ CNN meat quality model converted to {onnx_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error converting CNN meat quality model: {e}")
        return False

def convert_crnn_model():
    """Convert CRNN model to ONNX"""
    try:
        model_path = "model_meat_CRNN/crnn.pth"
        print(f"Loading CRNN model from {model_path}")
        
        # Create dummy input (CRNN typically uses 256x256)
        dummy_input = torch.randn(1, 3, 256, 256)
        
        # Load model
        model = torch.load(model_path, map_location='cpu')
        model.eval()
        
        # Export to ONNX
        onnx_path = "model_meat_CRNN/crnn.onnx"
        torch.onnx.export(
            model,
            dummy_input,
            onnx_path,
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={
                'input': {0: 'batch_size'},
                'output': {0: 'batch_size'}
            }
        )
        
        print(f"✅ CRNN model converted to {onnx_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error converting CRNN model: {e}")
        return False

def convert_yolo_models():
    """Convert YOLO models to ONNX"""
    try:
        # YOLO models typically need special handling
        # This is a placeholder - actual YOLO conversion depends on the specific YOLO version
        
        yolo_models = [
            ("model_meat_CNN/yolo26n.pt", "model_meat_CNN/yolo26n.onnx"),
            ("model_meat_CRNN/yolo11n.pt", "model_meat_CRNN/yolo11n.onnx")
        ]
        
        for pth_path, onnx_path in yolo_models:
            try:
                print(f"Converting YOLO model from {pth_path}")
                
                # Create dummy input (YOLO typically uses 640x640)
                dummy_input = torch.randn(1, 3, 640, 640)
                
                # Load YOLO model (adjust based on your YOLO implementation)
                model = torch.load(pth_path, map_location='cpu')
                model.eval()
                
                # Export to ONNX
                torch.onnx.export(
                    model,
                    dummy_input,
                    onnx_path,
                    export_params=True,
                    opset_version=11,
                    do_constant_folding=True,
                    input_names=['input'],
                    output_names=['output'],
                    dynamic_axes={
                        'input': {0: 'batch_size'},
                        'output': {0: 'batch_size'}
                    }
                )
                
                print(f"✅ YOLO model converted to {onnx_path}")
                
            except Exception as e:
                print(f"❌ Error converting {pth_path}: {e}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error in YOLO model conversion: {e}")
        return False

def main():
    """Main conversion function"""
    print("🔄 Starting model conversion process...")
    
    # Check if model directory exists
    if not Path("model_meat_CNN").exists() or not Path("model_meat_CRNN").exists():
        print("❌ Model directories not found. Please ensure model files are in the correct directories.")
        return False
    
    # Convert all models
    conversions = [
        convert_cnn_meat_type_model,
        convert_cnn_meat_quality_model,
        convert_crnn_model,
        convert_yolo_models
    ]
    
    success_count = 0
    for conversion_func in conversions:
        if conversion_func():
            success_count += 1
    
    print(f"\n📊 Conversion Summary: {success_count}/{len(conversions)} models converted successfully")
    
    if success_count == len(conversions):
        print("🎉 All models converted successfully!")
        print("\nNext steps:")
        print("1. Update the loadPyTorchModel function in meatAnalyzer.js to load ONNX models")
        print("2. Test the models with sample images")
        print("3. Verify model outputs match expected formats")
        return True
    else:
        print("⚠️  Some models failed to convert. Please check the error messages above.")
        return False

if __name__ == "__main__":
    main()
