import styles from "./ContentHeader.module.css";

function ContentHeader({ title, subTitle, breadcrumb, badge, actions }) {
	return (
		<div className={styles.header}>
			{/* 브레드크럼 */}
			{breadcrumb?.length > 0 && (
				<nav className={styles.breadcrumb}>
					{breadcrumb.map((item, idx) => (
						<span key={idx} className={styles.breadcrumbItem}>
							{idx > 0 && (
								<span className={styles.breadcrumbSep}>›</span>
							)}
							<span
								className={
									idx === breadcrumb.length - 1
										? styles.breadcrumbCurrent
										: ""
								}
							>
								{item}
							</span>
						</span>
					))}
				</nav>
			)}

			{/* 타이틀 + 액션 */}
			<div className={styles.main}>
				<div className={styles.titleGroup}>
					<div className={styles.titleRow}>
						<h1 className={styles.pageTitle}>{title}</h1>
						{/* badge는 전역 클래스(badge.css) 사용 */}
						{badge && (
							<span
								className={`badge badge-${badge.type || "primary"}`}
							>
								{badge.text}
							</span>
						)}
					</div>
					{subTitle && <p className={styles.subTitle}>{subTitle}</p>}
				</div>

				{/* 버튼은 전역 클래스(button.css) 사용 */}
				{actions?.length > 0 && (
					<div className={styles.actions}>
						{actions.map((action, idx) => (
							<button
								key={idx}
								className={`btn ${action.variant || "btn-secondary"}`}
								onClick={action.onClick}
								disabled={action.disabled}
							>
								{action.icon && <span>{action.icon}</span>}
								{action.label}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default ContentHeader;
