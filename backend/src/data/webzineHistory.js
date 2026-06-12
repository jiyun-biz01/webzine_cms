// ============================================
// 목업 웹진 발송 이력 데이터
//
// 실제 DB 연동 시 이 파일을 WebzineIssue 모델/쿼리로 교체하세요.
// htmlUrl: 발송 시 생성된 HTML 파일의 서버 저장 경로
// ============================================

const webzineHistory = [
  { id: 6, issue: 6, yearMonth: "2025-05", sentAt: "2025-05-01 09:00", articleCount: 12, status: "sent", htmlUrl: null },
  { id: 5, issue: 5, yearMonth: "2025-04", sentAt: "2025-04-01 09:00", articleCount: 10, status: "sent", htmlUrl: null },
  { id: 4, issue: 4, yearMonth: "2025-03", sentAt: "2025-03-01 09:00", articleCount: 11, status: "sent", htmlUrl: null },
  { id: 3, issue: 3, yearMonth: "2025-02", sentAt: "2025-02-01 09:00", articleCount:  9, status: "sent", htmlUrl: null },
  { id: 2, issue: 2, yearMonth: "2025-01", sentAt: "2025-01-01 09:00", articleCount: 13, status: "sent", htmlUrl: null },
  { id: 1, issue: 1, yearMonth: "2024-12", sentAt: "2024-12-01 09:00", articleCount:  8, status: "sent", htmlUrl: null },
];

export default webzineHistory;
