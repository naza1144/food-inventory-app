import ModelLoader from "../loaders/modelLoader.js";
import { imageToTensor } from "../processors/imageProcessor.js";

export async function analyzeFreshness(imagePath) {
  const { cnnFreshness } = await ModelLoader.loadAll();
  
  const tensor = await imageToTensor(imagePath);
  const output = await cnnFreshness.predict(tensor);
  
  // Return freshness level with highest confidence
  const levels = Object.keys(output);
  const maxLevel = levels.reduce((a, b) => output[a] > output[b] ? a : b);
  
  // Convert to percentage (0-100)
  const freshnessPercentage = {
    'fresh': output.fresh * 100,
    'medium': output.medium * 100,
    'spoiled': output.spoiled * 100
  };
  
  return {
    level: maxLevel,
    percentage: Math.round(freshnessPercentage[maxLevel]),
    details: freshnessPercentage
  };
}
