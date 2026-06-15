import { Router } from "express";
import * as subscriberController from "../controllers/subscriberController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// ============================================
// subscriberRoutes - 구독자 관련 라우터
//
// 공개 엔드포인트 (인증 불필요):
//   POST /subscribers/public/subscribe    → 구독 신청
//   POST /subscribers/public/unsubscribe  → 구독 취소
//
// 관리자 엔드포인트 (인증 필요):
//   GET  /subscribers                     → 목록 조회
//   GET  /subscribers/:id                 → 단건 조회
//   POST /subscribers                     → 등록
//   PATCH /subscribers/:id/deactivate     → 비활성화
//   PATCH /subscribers/:id/activate       → 활성화
//   POST /subscribers/bulk                → 일괄 처리
//
// ※ 정적 경로(/public/*, /bulk)는 반드시 /:id 보다 위에 선언해야 합니다.
// ============================================

const router = Router();

// ── 공개 라우트 (인증 불필요) ──────────────────
router.post("/public/subscribe",   subscriberController.publicSubscribe);
router.post("/public/unsubscribe", subscriberController.publicUnsubscribe);

// ── 일괄 처리 (/:id 보다 먼저 선언) ───────────
router.post("/bulk", authMiddleware, subscriberController.bulkAction);

// ── 월별 통계 ──────────────────────────────────
router.get("/stats/monthly",      authMiddleware, subscriberController.getMonthlyStats);
router.get("/stats/demographics", authMiddleware, subscriberController.getDemographicsStats);

// ── 관리자 CRUD ────────────────────────────────
router.get("/",    authMiddleware, subscriberController.getSubscribers);
router.get("/:id", authMiddleware, subscriberController.getSubscriber);
router.post("/",   authMiddleware, subscriberController.createSubscriber);

router.patch("/:id/deactivate", authMiddleware, subscriberController.deactivateSubscriber);
router.patch("/:id/activate",   authMiddleware, subscriberController.activateSubscriber);
router.patch("/:id/cancel",     authMiddleware, subscriberController.cancelSubscriber);

export default router;
