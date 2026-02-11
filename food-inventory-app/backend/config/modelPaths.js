import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  // ใช้ .pt ไฟล์เดิม (สำหรับ PyTorch ในอนาคต)
  yoloLabel: join(__dirname, '../ai_models/yolo/yolo11n.pt'),
  yoloMeat: join(__dirname, '../ai_models/yolo/best.pt'),

  cnnType: join(__dirname, '../ai_models/cnn/meat_type_model.pth'),
  cnnFreshness: join(__dirname, '../ai_models/cnn/meat_quality_model.pth'),

  crnn: join(__dirname, '../ai_models/crnn/crnn.pth')
};