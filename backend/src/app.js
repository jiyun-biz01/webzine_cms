import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import mainPageRoutes from "./routes/mainPageRoutes.js";
import webzineRoutes from "./routes/webzineRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// app.js - Express 앱 설정
//
// 새 도메인(카테고리, 미디어 등) 추가 방법:
//   1. src/data/xxx.js         목업 데이터 생성
//   2. src/controllers/xxxController.js  로직 작성
//   3. src/routes/xxxRoutes.js  라우터 정의
//   4. 여기서 app.use("/xxx", xxxRoutes) 한 줄 추가
// ============================================

const app = express();

// ── 미들웨어 ──────────────────────────────────
app.use(cors({ origin: true, credentials: true }));

// 요청 바디를 JSON으로 파싱 (req.body 사용 가능하게)
app.use(express.json());

// ── 정적 파일 서빙 ────────────────────────────
// 업로드된 이미지를 /uploads/파일명 으로 접근 가능하게 함
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── 라우터 등록 ───────────────────────────────
app.use("/auth",      authRoutes);
app.use("/articles",  articleRoutes);
app.use("/main-page", mainPageRoutes);
app.use("/webzine",   webzineRoutes);
app.use("/templates", templateRoutes);
app.use("/upload",    uploadRoutes);
app.use("/dashboard",   dashboardRoutes);
app.use("/subscribers", subscriberRoutes);
app.use("/categories",    categoryRoutes);
app.use("/notifications", notificationRoutes);
app.use("/settings",      settingsRoutes);

// ── API 문서 ──────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── 헬스체크 ──────────────────────────────────
// 서버가 살아있는지 확인하는 간단한 엔드포인트
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 처리 ──────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "존재하지 않는 API 경로입니다." });
});

export default app;
