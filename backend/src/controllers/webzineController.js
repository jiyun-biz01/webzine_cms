import webzineHistory from "../data/webzineHistory.js";

// ============================================
// webzineController - 웹진 발송 이력 관련 로직
//
// 실제 DB 연동 시:
//   webzineHistory 배열 → ORM 쿼리로 교체
//   htmlUrl → 실제 파일 저장 후 경로 기록
// ============================================

// ── 발송 이력 목록 조회 ────────────────────────
// GET /webzine/history
export function getHistory(req, res) {
  // 최신 회차가 위에 오도록 정렬
  const data = [...webzineHistory].sort((a, b) => b.issue - a.issue);
  res.json({ data, total: data.length });
}

// ── 발송 이력 단건 조회 ────────────────────────
// GET /webzine/history/:id
export function getHistoryItem(req, res) {
  const id   = parseInt(req.params.id);
  const item = webzineHistory.find((h) => h.id === id);

  if (!item) {
    return res.status(404).json({ message: "해당 웹진 이력을 찾을 수 없습니다." });
  }

  res.json(item);
}
