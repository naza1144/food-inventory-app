import paths from "../../config/modelPaths.js";
import * as tf from "@tensorflow/tfjs-node";

class ModelLoader {
  static models = null;

  static async loadAll() {
    if (this.models) return this.models;

    try {
      console.log("🔄 Loading real AI models...");
      
      // Load YOLO models
      const yoloLabel = await tf.loadGraphModel(`file://${paths.yoloLabel}`);
      const yoloMeat = await tf.loadGraphModel(`file://${paths.yoloMeat}`);
      
      // Load CNN models
      const cnnType = await tf.loadLayersModel(`file://${paths.cnnType}`);
      const cnnFreshness = await tf.loadLayersModel(`file://${paths.cnnFreshness}`);
      
      // Load CRNN model
      const crnn = await tf.loadLayersModel(`file://${paths.crnn}`);

      this.models = {
        yoloLabel,
        yoloMeat,
        cnnType,
        cnnFreshness,
        crnn
      };

      console.log("✅ All real models loaded successfully!");
      return this.models;
      
    } catch (error) {
      console.error("❌ Failed to load real models, falling back to mock:", error);
      return this.loadMockModels();
    }
  }

  static loadMockModels() {
    this.models = {
      yoloLabel: { 
        mock: true, 
        forward: async (tensor) => {
          console.log("Mock yoloLabel.forward called");
          return [];
        }
      },
      yoloMeat: { 
        mock: true, 
        forward: async (tensor) => {
          console.log("Mock yoloMeat.forward called");
          return [{ class: 'chicken', confidence: 0.8 }];
        }
      },
      cnnType: { 
        mock: true, 
        predict: async (tensor) => {
          console.log("Mock cnnType.predict called");
          return { chicken: 0.9, beef: 0.05, pork: 0.05 };
        }
      },
      cnnFreshness: { 
        mock: true, 
        predict: async (tensor) => {
          console.log("Mock cnnFreshness.predict called");
          return { fresh: 0.8, medium: 0.15, spoiled: 0.05 };
        }
      },
      crnn: { 
        mock: true, 
        predict: async (tensor) => {
          console.log("Mock crnn.predict called");
          return "25/12/2025";
        }
      }
    };
    
    console.log("⚠️ Using mock models");
    return this.models;
  }
}

export default ModelLoader;