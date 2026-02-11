import ModelLoader from "../loaders/modelLoader.js";
import { imageToTensor } from "../processors/imageProcessor.js";


export async function analyzeMeatType(imagePath) {
const { cnnType } = await ModelLoader.loadAll();


const tensor = await imageToTensor(imagePath);
const output = await cnnType.forward(tensor);


return output.argmax().item();
}