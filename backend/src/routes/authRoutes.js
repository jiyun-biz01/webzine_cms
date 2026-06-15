import { Router } from "express";
import * as authController from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// ============================================
// authRoutes - 인증 관련 라우터
//
// 라우터란?
//   "어떤 URL + HTTP 메서드 조합이 어떤 컨트롤러 함수를 실행하는지"
//   를 정의하는 곳입니다.
//   비즈니스 로직은 여기 쓰지 않습니다.
//
// app.js에서 이 라우터를 /auth 경로에 등록하면
//   POST /auth/login → login 함수 실행
//   POST /auth/logout → logout 함수 실행
//   GET  /auth/me    → getMe 함수 실행 (인증 필요)
// ============================================

const router = Router();

router.post("/login",    authController.login);
router.post("/logout",   authController.logout);
router.get("/me",        authMiddleware, authController.getMe);
router.put("/password",  authMiddleware, authController.changePassword); // authMiddleware: 로그인 필요

export default router;
