import "dotenv/config";
import app from "./src/app.js";

// ============================================
// server.js - 서버 시작점
//
// 실행 방법:
//   개발: npm run dev   (nodemon으로 파일 변경 시 자동 재시작)
//   운영: npm start
// ============================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✓ 서버 실행 중: http://localhost:${PORT}`);
  console.log(`✓ 헬스체크:    http://localhost:${PORT}/health`);
  console.log(`─────────────────────────────────────`);
  console.log(`  POST /auth/login`);
  console.log(`  GET  /auth/me`);
  console.log(`  GET  /articles`);
  console.log(`  POST /articles`);
});
