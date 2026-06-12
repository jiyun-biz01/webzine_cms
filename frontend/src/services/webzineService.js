import api from "@/api/axios";

// ============================================
// webzineService - 웹진 발송 이력 API 함수 모음
// ============================================

// 발송 이력 목록 조회
// 응답 예시: { data: [...], total: 6 }
export async function getHistory() {
	const response = await api.get("/webzine/history");
	return response.data;
}
