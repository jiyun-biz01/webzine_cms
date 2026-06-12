import { useEffect, useState } from "react";

// ============================================
// 다크모드 커스텀 훅
// - 시스템 설정 자동 감지
// - localStorage에 저장 (새로고침 후에도 유지)
// - html[data-theme="dark"] 클래스로 제어
// ============================================
export function useTheme() {
	// localStorage 또는 시스템 설정에서 초기값 읽기
	const getInitialTheme = () => {
		const saved = localStorage.getItem("theme");
		if (saved) return saved === "dark";
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	};

	const [isDark, setIsDark] = useState(getInitialTheme);

	// isDark 바뀔 때마다 HTML에 반영
	useEffect(() => {
		const root = document.documentElement;

		if (isDark) {
			root.setAttribute("data-theme", "dark");
			root.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			root.removeAttribute("data-theme");
			root.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [isDark]);

	const toggle = () => setIsDark((prev) => !prev);

	return { isDark, toggle };
}
