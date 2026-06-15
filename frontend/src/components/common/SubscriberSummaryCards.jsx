import StatCard from "./StatCard";
import styles from "./SubscriberSummaryCards.module.css";

function SubscriberSummaryCards({ stats = {} }) {
	return (
		<div className={styles.grid}>
			<StatCard label="전체 구독자" value={stats.total     ?? 0} color="primary" />
			<StatCard label="활성"         value={stats.active    ?? 0} color="success" />
			<StatCard label="비활성"       value={stats.inactive  ?? 0} color="warning" />
			<StatCard label="구독 취소"    value={stats.cancelled ?? 0} color="danger"  />
		</div>
	);
}

export default SubscriberSummaryCards;
