import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "@/services/authService";

// ============================================
// AuthContext - 전역 인증 상태 관리
//
// 앱 전체에서 로그인 상태를 공유합니다.
// 어떤 컴포넌트에서든 useAuth()로 꺼내 쓰세요.
//
// 흐름:
//   앱 시작 → localStorage에 토큰 있으면 → /auth/me로 유저 정보 복원
//   login() → 토큰 저장 → user 상태 갱신
//   logout() → 토큰 삭제 → user null → 로그인 페이지 이동
// ============================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	// 앱 시작 시 토큰 복원이 끝났는지 여부
	// false인 동안은 로그인 여부를 아직 모르는 상태 → 화면을 렌더링하지 않음
	const [initializing, setInitializing] = useState(true);

	// ── 앱 시작 시 토큰 복원 ──────────────────────
	// 새로고침해도 로그인이 유지되는 이유입니다.
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			setInitializing(false);
			return;
		}
		// 토큰이 있으면 서버에 유효한지 확인하고 유저 정보를 가져옴
		authService
			.getMe()
			.then((userData) => setUser(userData))
			.catch(() => {
				// 토큰이 만료되었거나 유효하지 않은 경우
				localStorage.removeItem("token");
			})
			.finally(() => setInitializing(false));
	}, []);

	// ── 로그인 ────────────────────────────────────
	const login = async (credentials) => {
		const { token, user: userData } = await authService.login(credentials);
		localStorage.setItem("token", token);
		setUser(userData);
	};

	// ── 로그아웃 ──────────────────────────────────
	const logout = async () => {
		try {
			await authService.logout();
		} catch {
			// 서버 에러가 나도 클라이언트 로그아웃은 진행
		} finally {
			localStorage.removeItem("token");
			setUser(null);
			window.location.href = "/login";
		}
	};

	// 초기화가 끝나기 전엔 아무것도 렌더링하지 않음
	// (깜빡임 방지: 로그인 상태인데 잠깐 로그인 화면이 보이는 현상)
	if (initializing) return null;

	return (
		<AuthContext.Provider value={{ user, setUser, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
	}
	return context;
}

export default AuthContext;
