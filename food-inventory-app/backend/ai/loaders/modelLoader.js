
import paths from "../../config/modelPaths.js";


class ModelLoader {
static models = null;


static async loadAll() {
if (this.models) return this.models;


this.models = {
yoloLabel: { mock: true, path: paths.yoloLabel },
yoloMeat: { mock: true, path: paths.yoloMeat },

cnnType: { mock: true, path: paths.cnnType },
cnnFreshness: { mock: true, path: paths.cnnFreshness },

crnn: { mock: true, path: paths.crnn }
};


console.log("✅ All models loaded (mock mode)");
return this.models;
}
}


export default ModelLoader;