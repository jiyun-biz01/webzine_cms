import { Router } from "express";
import * as webzineController from "../controllers/webzineController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// ============================================
// webzineRoutes - 웹진 발송 이력 라우터
//
//   GET /webzine/history      → getHistory  (목록)
//   GET /webzine/history/:id  → getHistoryItem (단건)
// ============================================

const router = Router();

router.post("/send",        authMiddleware, webzineController.sendWebzine);
router.get("/history",     webzineController.getHistory);
router.get("/history/:id", webzineController.getHistoryItem);

export default router;
