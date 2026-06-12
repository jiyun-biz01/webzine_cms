import styles from "./EmptyState.module.css";

// ============================================
// EmptyState - 데이터가 없을 때 표시하는 컴포넌트
//
// Props:
//   message - 표시할 메시지 (기본값: "데이터가 없습니다.")
//   icon    - 표시할 아이콘 문자 (기본값: "◻")
// ============================================

function EmptyState({ message = "데이터가 없습니다.", icon = "◻" }) {
	return (
		<div className={styles.wrapper}>
			<span className={styles.icon}>{icon}</span>
			<p className={styles.message}>{message}</p>
		</div>
	);
}

export default EmptyState;
