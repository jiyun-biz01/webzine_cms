import api from "@/api/axios";

// ============================================
// articleService - 기사 관련 API 함수 모음
// ============================================

// 기사 목록 조회
// params 예: { page: 1, limit: 10, search: "검색어", status: "published" }
export async function getArticles(params = {}) {
	const response = await api.get("/articles", { params });
	return response.data;
	// 응답 예시: { data: [...], total: 128, page: 1, limit: 10 }
}

// 기사 단건 조회
export async function getArticle(id) {
	const response = await api.get(`/articles/${id}`);
	return response.data;
}

// 기사 생성
export async function createArticle(body) {
	const response = await api.post("/articles", body);
	return response.data;
}

// 기사 수정
export async function updateArticle(id, body) {
	const response = await api.put(`/articles/${id}`, body);
	return response.data;
}

// 기사 삭제
export async function deleteArticle(id) {
	await api.delete(`/articles/${id}`);
}
