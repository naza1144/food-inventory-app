import ModelLoader from "../loaders/modelLoader.js";
import { imageToTensor } from "../processors/imageProcessor.js";

export async function readExpiration(imagePath) {
  const { crnn } = await ModelLoader.loadAll();
  
  const tensor = await imageToTensor(imagePath, 100);
  const result = await crnn.predict(tensor);
  
  return result;
}