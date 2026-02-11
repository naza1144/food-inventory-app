import ModelLoader from "../loaders/modelLoader.js";
import { imageToTensor } from "../processors/imageProcessor.js";

export async function analyzeMeatType(imagePath) {
  const { cnnType } = await ModelLoader.loadAll();
  
  const tensor = await imageToTensor(imagePath);
  const output = await cnnType.predict(tensor);
  
  // Return the meat type with highest confidence
  const types = Object.keys(output);
  const maxType = types.reduce((a, b) => output[a] > output[b] ? a : b);
  
  return maxType;
}