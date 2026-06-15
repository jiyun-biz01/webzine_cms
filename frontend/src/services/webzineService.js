import api from "@/api/axios";

// ============================================
// webzineService - 웹진 발송 이력 API 함수 모음
// ============================================

// 발송 이력 목록 조회
export async function getHistory() {
	const response = await api.get("/webzine/history");
	return response.data;
}

// 웹진 발송
export async function sendWebzine(data) {
	const response = await api.post("/webzine/send", data);
	return response.data;
}
