// ============================================
// StatusBadge - 기사 상태 뱃지 컴포넌트
//
// Props:
//   status - "published" | "draft" | "archived"
//
// 새 상태 추가 시 statusConfig에만 항목 추가하면 됩니다.
// ============================================

const statusConfig = {
	published: { label: "발행", badgeClass: "badge-success" },
	draft:     { label: "임시저장", badgeClass: "badge-warning" },
	archived:  { label: "보관", badgeClass: "badge-info" },
};

function StatusBadge({ status }) {
	const config = statusConfig[status];

	// 알 수 없는 상태값이 들어왔을 때 대비
	if (!config) {
		return <span className="badge">{status}</span>;
	}

	return (
		<span className={`badge ${config.badgeClass}`}>
			{config.label}
		</span>
	);
}

export default StatusBadge;
