import styles from "./LoadingSpinner.module.css";

// ============================================
// LoadingSpinner - 로딩 중 표시 컴포넌트
//
// Props:
//   size - "sm" | "md" (기본값: "md")
// ============================================

function LoadingSpinner({ size = "md" }) {
	return (
		<div className={styles.wrapper}>
			<span className={`${styles.spinner} ${styles[size]}`} />
		</div>
	);
}

export default LoadingSpinner;
