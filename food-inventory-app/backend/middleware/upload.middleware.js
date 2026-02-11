import multer from "multer";
import path from "path";
import fs from "fs";

// 📁 path เก็บไฟล์
const uploadDir = "storage/uploads";
const resultsDir = "storage/results";

// สร้างโฟลเดอร์ถ้ายังไม่มี
if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true });
}

// สร้างโฟลเดอร์สำหรับผลลัพธ์
if (!fs.existsSync(resultsDir)) {
fs.mkdirSync(resultsDir, { recursive: true });
}

// ตั้งค่า storage
const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, uploadDir);
},

filename: (req, file, cb) => {
const ext = path.extname(file.originalname);
const name = Date.now() + ext;
cb(null, name);
}
});

// 🛡️ filter เฉพาะรูป
const fileFilter = (req, file, cb) => {
const allowed = [".jpg", ".jpeg", ".png"];

const ext = path.extname(file.originalname).toLowerCase();

if (allowed.includes(ext)) {
cb(null, true);
} else {
cb(new Error("Only image files allowed"));
}
};

// จำกัดขนาด 5MB
const limits = {
fileSize: 5 * 1024 * 1024
};

export default multer({
storage,
fileFilter,
limits
});

// Export paths for use in controllers
export { uploadDir, resultsDir };
