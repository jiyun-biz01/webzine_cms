import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";

// ============================================
// dashboardRoutes
//
// GET /dashboard → getDashboard (인증 없이 허용 - articleRoutes 패턴 동일)
// ============================================

const router = Router();

router.get("/", getDashboard);

export default router;
