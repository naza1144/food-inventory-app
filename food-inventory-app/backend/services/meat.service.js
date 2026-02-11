import { detectLabel } from "../ai/detectors/labelDetector.js";
import { readExpiration } from "../ai/recognizers/ocrRecognizer.js";
import { analyzeMeatType } from "../ai/analyzers/meatTypeAnalyzer.js";
import { analyzeFreshness } from "../ai/analyzers/freshnessAnalyzer.js";

class MeatService {
  static async analyze(imagePath) {
    // Step 1: YOLO Label Detection
    const hasLabel = await detectLabel(imagePath);
    
    if (hasLabel) {
      // Step 2a: Found label - Use OCR (CRNN)
      const expiry = await readExpiration(imagePath);
      return {
        hasLabel: true,
        expirationDate: expiry,
        analysisType: 'label+ocr'
      };
    }
    
    // Step 2b: No label - Use YOLO Meat + CNN
    const meatType = await analyzeMeatType(imagePath);
    const freshness = await analyzeFreshness(imagePath);
    
    return {
      hasLabel: false,
      meatType: meatType,
      freshness: freshness,
      analysisType: 'meat+cnn+freshness'
    };
  }
}

export default MeatService;