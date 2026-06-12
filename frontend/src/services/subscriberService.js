import api from "@/api/axios";

// ============================================
// subscriberService - 구독자 관련 API 함수 모음
// ============================================

// ── 관리자: 구독자 목록 조회 ───────────────────
// params 예: { page: 1, limit: 10, search: "검색어", status: "active" }
export async function getSubscribers(params = {}) {
	const response = await api.get("/subscribers", { params });
	return response.data;
	// 응답: { data: [...], total: 15, page: 1, limit: 10, stats: { total, active, inactive } }
}

// ── 관리자: 구독자 단건 조회 ───────────────────
export async function getSubscriber(id) {
	const response = await api.get(`/subscribers/${id}`);
	return response.data;
}

// ── 관리자: 구독자 등록 ────────────────────────
export async function createSubscriber(email) {
	const response = await api.post("/subscribers", { email });
	return response.data;
}

// ── 관리자: 비활성화 ───────────────────────────
export async function deactivateSubscriber(id) {
	const response = await api.patch(`/subscribers/${id}/deactivate`);
	return response.data;
}

// ── 관리자: 활성화 ─────────────────────────────
export async function activateSubscriber(id) {
	const response = await api.patch(`/subscribers/${id}/activate`);
	return response.data;
}

// ── 관리자: 일괄 처리 ─────────────────────────
// action: "activate" | "deactivate"
// ids: [1, 2, 3, ...]
export async function bulkDeactivate(ids) {
	await api.post("/subscribers/bulk", { action: "deactivate", ids });
}

export async function bulkActivate(ids) {
	await api.post("/subscribers/bulk", { action: "activate", ids });
}

// ── 공개: 구독 신청 ────────────────────────────
export async function publicSubscribe(email) {
	const response = await api.post("/subscribers/public/subscribe", { email });
	return response.data;
	// 응답: { reactivated: false } 또는 { reactivated: true }
}

// ── 공개: 구독 취소 ────────────────────────────
export async function publicUnsubscribe(email) {
	await api.post("/subscribers/public/unsubscribe", { email });
}
