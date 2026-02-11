#!/usr/bin/env python3
"""
แปลงโมเดล YOLO จาก .pt เป็น .onnx ด้วยพารามิเตอร์พิเศษ
"""

from ultralytics import YOLO
import os

def convert_model(pt_path, onnx_path):
    """แปลงโมเดลจาก .pt เป็น .onnx"""
    try:
        print(f"🔄 Converting {pt_path} → {onnx_path}")
        
        # โหลดโมเดล
        model = YOLO(pt_path)
        
        # แปลงเป็น ONNX ด้วยพารามิเตอร์พิเศษ
        model.export(
            format='onnx',
            imgsz=640,
            simplify=False,  # ปิดการ simplify
            opset=11,      # ใช้ opset เก่ากว่า
            dynamic=False,   # ไม่ใช้ dynamic axes
        )
        
        print(f"✅ Successfully converted {pt_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error converting {pt_path}: {e}")
        return False

if __name__ == "__main__":
    # แปลงโมเดลทั้งสอง
    models = [
        ("ai_models/yolo/yolo11n.pt", "ai_models/yolo/yolo11n_v2.onnx"),
        ("ai_models/yolo/best.pt", "ai_models/yolo/best_v2.onnx")
    ]
    
    for pt_path, onnx_path in models:
        if os.path.exists(pt_path):
            convert_model(pt_path, onnx_path)
        else:
            print(f"⚠️ File not found: {pt_path}")
    
    print("🎯 Conversion complete!")
