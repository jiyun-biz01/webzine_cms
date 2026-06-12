import { Router } from "express";
import * as templateController from "../controllers/templateController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// ============================================
// templateRoutes - 디자인 템플릿 라우터
//
//   GET    /templates      → getTemplates  (목록)
//   GET    /templates/:id  → getTemplate   (단건)
//   POST   /templates      → createTemplate
//   PUT    /templates/:id  → updateTemplate
//   DELETE /templates/:id  → deleteTemplate
// ============================================

const router = Router();

router.get("/",    templateController.getTemplates);
router.get("/:id", templateController.getTemplate);

router.post("/",      authMiddleware, templateController.createTemplate);
router.put("/:id",    authMiddleware, templateController.updateTemplate);
router.delete("/:id", authMiddleware, templateController.deleteTemplate);

export default router;
