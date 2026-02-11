import { detectLabel } from "../ai/detectors/labelDetector.js";
import { readExpiration } from "../ai/recognizers/ocrRecognizer.js";
import { analyzeMeatType } from "../ai/analyzers/meatTypeAnalyzer.js";
import { analyzeFreshness } from "../ai/analyzers/freshnessAnalyzer.js";


class MeatService {
static async analyze(imagePath) {
const hasLabel = await detectLabel(imagePath);


if (hasLabel) {
const expiry = await readExpiration(imagePath);


return {
hasLabel: true,
expirationDate: expiry
};
}


const type = await analyzeMeatType(imagePath);
const freshness = await analyzeFreshness(imagePath);


return {
hasLabel: false,
meatType: type,
freshness
};
}
}


export default MeatService;