// Mock implementation since jimp and torch-node are not available
// import Jimp from "jimp";
// import torch from "torch-node";

export async function imageToTensor(imagePath, size = 224) {
  // Mock implementation - return dummy tensor
  console.log(`Processing image: ${imagePath} (mock mode)`);
  
  return {
    data: new Float32Array(size * size * 3),
    shape: [1, size, size, 3],
    mock: true
  };
}

export async function preprocessForYOLO(imageTensor) {
  // Mock YOLO preprocessing
  console.log('Preprocessing for YOLO (mock mode)');
  return {
    data: new Float32Array(640 * 640 * 3),
    shape: [1, 640, 640, 3],
    mock: true
  };
}

export function disposeTensor(tensor) {
  // Mock tensor disposal
  if (tensor && tensor.mock) {
    console.log('Disposing mock tensor');
  }
}