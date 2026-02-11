import ModelLoader from "../loaders/modelLoader.js";
import { imageToTensor } from "../processors/imageProcessor.js";


export async function detectLabel(imagePath) {
const { yoloLabel } = await ModelLoader.loadAll();


const tensor = await imageToTensor(imagePath, 640);
const result = await yoloLabel.forward(tensor);


return result.length > 0;
}