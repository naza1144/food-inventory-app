import MeatService from "../services/meat.service.js";

export async function scanFood(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Debug: แสดง path ที่ได้รับ
    console.log('req.file.path:', req.file.path);
    console.log('req.file.filename:', req.file.filename);
    
    const result = await MeatService.analyze(req.file.path);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
}