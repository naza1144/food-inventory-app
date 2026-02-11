import express from "express";
import { scanFood } from "../controllers/food.controller.js";
import upload from "../middleware/upload.middleware.js";


const router = express.Router();


router.post("/scan", upload.single("image"), scanFood);


export default router;