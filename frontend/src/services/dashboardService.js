import api from "@/api/axios";

// ============================================
// dashboardService - 대시보드 API 함수 모음
// ============================================

// 대시보드 통계 조회
// 응답 예시: { stats, recentArticles, issueStatus }
export async function getDashboard() {
  const response = await api.get("/dashboard");
  return response.data;
}
