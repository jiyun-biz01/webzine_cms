import { Router } from "express";
import * as articleController from "../controllers/articleController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// ============================================
// articleRoutes - 기사 관련 라우터
//
// 모든 기사 API는 로그인한 사용자만 접근 가능하므로
// router.use(authMiddleware) 로 전체에 인증을 적용합니다.
//
// 결과:
//   GET    /articles      → getArticles  (목록 + 통계)
//   GET    /articles/:id  → getArticle   (단건)
//   POST   /articles      → createArticle
//   PUT    /articles/:id  → updateArticle
//   DELETE /articles/:id  → deleteArticle
// ============================================

const router = Router();

// GET(읽기)은 인증 없이 허용 — 로그인 페이지 완성 후 authMiddleware 추가 예정
router.get("/",    articleController.getArticles);
router.get("/:id", articleController.getArticle);

// POST/PUT/DELETE(쓰기)는 인증 필요
router.post("/",      authMiddleware, articleController.createArticle);
router.put("/:id",    authMiddleware, articleController.updateArticle);
router.delete("/:id", authMiddleware, articleController.deleteArticle);

export default router;
