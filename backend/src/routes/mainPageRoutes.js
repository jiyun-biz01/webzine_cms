import { Router } from "express";
import * as mainPageController from "../controllers/mainPageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// GET  /main-page → 누구나 조회 가능 (웹진 프론트에서도 사용)
// PUT  /main-page → 로그인한 편집자만 수정 가능

const router = Router();

router.get("/",  mainPageController.getMainPage);
router.put("/",  authMiddleware, mainPageController.updateMainPage);

export default router;
