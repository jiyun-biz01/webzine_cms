import axios from "axios";

// ============================================
// axios 인스턴스 - API 요청의 기본 설정
//
// 모든 API 요청은 이 인스턴스를 통해 보냅니다.
// import api from "@/api/axios"; 로 가져다 쓰세요.
// ============================================

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000, // 10초 안에 응답 없으면 에러 처리
});

// ============================================
// 요청 인터셉터 (Request Interceptor)
// 모든 요청이 서버로 나가기 "직전"에 실행됩니다.
// → localStorage의 토큰을 꺼내서 Authorization 헤더에 자동으로 붙여줍니다.
// ============================================
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// ============================================
// 응답 인터셉터 (Response Interceptor)
// 서버에서 응답이 오고 나서 컴포넌트에 전달되기 "직전"에 실행됩니다.
//
// 성공(2xx): 그대로 통과
// 실패:
//   401 Unauthorized → 토큰 만료/미인증 → 로그인 페이지로 이동
//   그 외 에러 → 그대로 throw (각 서비스에서 처리)
// ============================================
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

export default api;
