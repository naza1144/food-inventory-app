#!/usr/bin/env python3
"""
Python Bridge สำหรับโหลดและใช้งานโมเดล PyTorch จริง
"""

import sys
import json
import torch
from ultralytics import YOLO
import numpy as np
from PIL import Image
import os

class ModelBridge:
    def __init__(self):
        self.models = {}
        self.load_models()
    
    def load_models(self):
        """โหลดโมเดลจริง"""
        try:
            print("🔄 Loading real PyTorch models...")
            
            # โหลด YOLO models
            self.models['yoloLabel'] = YOLO('ai_models/yolo/yolo11n.pt')
            self.models['yoloMeat'] = YOLO('ai_models/yolo/best.pt')
            
            print("✅ Real PyTorch models loaded successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Failed to load models: {e}")
            return False
    
    def detect_label(self, image_path):
        """ตรวจจับ label บนภาพ"""
        try:
            if not os.path.exists(image_path):
                return {"has_label": False, "error": "File not found"}
                
            results = self.models['yoloLabel'](image_path)
            has_label = len(results[0].boxes) > 0
            return {"has_label": has_label}
        except Exception as e:
            print(f"❌ Label detection error: {e}")
            return {"has_label": False, "error": str(e)}
    
    def analyze_meat(self, image_path):
        """วิเคราะห์ประเภทเนื้อ"""
        try:
            if not os.path.exists(image_path):
                return {"meat_type": "unknown", "confidence": 0.0, "error": "File not found"}
                
            results = self.models['yoloMeat'](image_path)
            if len(results[0].boxes) > 0:
                # ดึงคลาสที่มี confidence สูงสุด
                box = results[0].boxes[0]
                class_id = int(box.cls)
                confidence = float(box.conf)
                
                # แปลง class_id เป็นชื่อเนื้อ (ตามโมเดลของคุณ)
                meat_classes = {0: 'pork', 1: 'beef', 2: 'chicken'}
                meat_type = meat_classes.get(class_id, 'unknown')
                
                return {
                    "meat_type": meat_type,
                    "confidence": confidence
                }
            else:
                return {"meat_type": "unknown", "confidence": 0.0}
        except Exception as e:
            print(f"❌ Meat analysis error: {e}")
            return {"meat_type": "unknown", "confidence": 0.0, "error": str(e)}
    
    def analyze_freshness(self, image_path):
        """วิเคราะห์ความสด (mock ชั่วคราว)"""
        # สำหรับ CNN freshness จะเพิ่มเมื่อมีโมเดล
        import random
        freshness_levels = ['fresh', 'medium', 'spoiled']
        level = random.choices(freshness_levels, weights=[0.7, 0.2, 0.1])[0]
        percentage = {'fresh': 85, 'medium': 60, 'spoiled': 25}[level]
        
        return {
            "level": level,
            "percentage": percentage
        }

def main():
    """Main function for command line interface"""
    if len(sys.argv) < 3:
        result = {"error": "Usage: python python_bridge.py <function> <image_path>"}
        print(json.dumps(result, ensure_ascii=False))
        return
    
    function_name = sys.argv[1]
    image_path = sys.argv[2]
    
    bridge = ModelBridge()
    
    if function_name == "detect_label":
        result = bridge.detect_label(image_path)
    elif function_name == "analyze_meat":
        result = bridge.analyze_meat(image_path)
    elif function_name == "analyze_freshness":
        result = bridge.analyze_freshness(image_path)
    else:
        result = {"error": f"Unknown function: {function_name}"}
    
    # ใช้ ensure_ascii=False สำหรับภาษาไทย
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
