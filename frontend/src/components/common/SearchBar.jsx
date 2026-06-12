import styles from "./SearchBar.module.css";

// ============================================
// SearchBar - 검색 입력창 컴포넌트
//
// Props:
//   value       - 현재 입력값 (상위 컴포넌트의 state)
//   onChange    - 입력값 변경 시 호출: (value: string) => void
//   placeholder - 안내 문구 (기본값: "검색...")
// ============================================

function SearchBar({ value, onChange, placeholder = "검색..." }) {
	return (
		<input
			className={`form-input ${styles.searchInput}`}
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
		/>
	);
}

export default SearchBar;
