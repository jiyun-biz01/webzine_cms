import api from "@/api/axios";

// ============================================
// authService - 인증 관련 API 함수 모음
//
// 백엔드 API 엔드포인트가 달라지면 이 파일만 수정하면 됩니다.
// 컴포넌트 코드는 건드릴 필요 없습니다.
// ============================================

// 로그인
// 서버에서 { token, user } 형태로 응답을 준다고 가정합니다.
export async function login({ id, password }) {
	const response = await api.post("/auth/login", { id, password });
	return response.data; // { token, user }
}

// 로그아웃
export async function logout() {
	await api.post("/auth/logout");
}

// 현재 로그인된 사용자 정보 가져오기
// 앱 시작 시 토큰이 유효한지 검증할 때 사용합니다.
export async function getMe() {
	const response = await api.get("/auth/me");
	return response.data; // user 객체
}
