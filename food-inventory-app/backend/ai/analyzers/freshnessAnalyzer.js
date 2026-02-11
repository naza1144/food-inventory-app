import ModelLoader from "../loaders/modelLoader.js";
import { imageToTensor } from "../processors/imageProcessor.js";


export async function analyzeFreshness(imagePath) {
const { cnnFreshness } = await ModelLoader.loadAll();


const tensor = await imageToTensor(imagePath);
const output = await cnnFreshness.forward(tensor);


return output.argmax().item();
}