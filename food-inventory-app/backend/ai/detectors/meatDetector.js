import ModelLoader from "../loaders/modelLoader.js";
import { imageToTensor } from "../processors/imageProcessor.js";


export async function detectMeat(imagePath) {
const { yoloMeat } = await ModelLoader.loadAll();


const tensor = await imageToTensor(imagePath, 640);
return await yoloMeat.forward(tensor);
}