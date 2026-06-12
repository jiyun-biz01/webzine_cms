import styles from "./StatCard.module.css";

// ============================================
// StatCard - 통계 카드 컴포넌트
//
// Props:
//   label  - 카드 제목 (예: "전체 기사")
//   value  - 메인 숫자 (예: "128")
//   delta  - 변화량 설명 (예: "+12 이번 주")
//   color  - 왼쪽 테두리 색상: "primary" | "success" | "warning" | "info" | "danger"
// ============================================

function StatCard({ label, value, delta, color = "primary" }) {
	return (
		<div className={`${styles.statCard} ${styles[`stat_${color}`]}`}>
			<span className={styles.statLabel}>{label}</span>
			<strong className={styles.statValue}>{value}</strong>
			{delta && <span className={styles.statDelta}>{delta}</span>}
		</div>
	);
}

export default StatCard;
