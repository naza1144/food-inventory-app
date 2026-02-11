#!/usr/bin/env python3
"""
แปลงโมเดล YOLO จาก .pt เป็น .onnx
"""

from ultralytics import YOLO
import os

def convert_model(pt_path, onnx_path):
    """แปลงโมเดลจาก .pt เป็น .onnx"""
    try:
        print(f"🔄 Converting {pt_path} → {onnx_path}")
        
        # โหลดโมเดล
        model = YOLO(pt_path)
        
        # แปลงเป็น ONNX
        model.export(
            format='onnx',
            imgsz=640,
            simplify=True,
            opset=12
        )
        
        print(f"✅ Successfully converted {pt_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error converting {pt_path}: {e}")
        return False

if __name__ == "__main__":
    # แปลงโมเดลทั้งสอง
    models = [
        ("ai_models/yolo/yolo11n.pt", "ai_models/yolo/yolo11n.onnx"),
        ("ai_models/yolo/best.pt", "ai_models/yolo/best.onnx")
    ]
    
    for pt_path, onnx_path in models:
        if os.path.exists(pt_path):
            convert_model(pt_path, onnx_path)
        else:
            print(f"⚠️ File not found: {pt_path}")
    
    print("🎯 Conversion complete!")
