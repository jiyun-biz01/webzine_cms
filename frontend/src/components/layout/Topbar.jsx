import { useAuth } from "@/context/AuthContext";
import styles from "./Topbar.module.css";

function Topbar({ isDark, onToggleDark }) {
	const { user } = useAuth();

	return (
		<header className={styles.topbar}>
			<div className={styles.greeting}>
				안녕하세요, <strong>{user?.name}</strong>님
			</div>

			<div className={styles.rightGroup}>
				<button className={styles.iconBtn} title="알림">
					🔔
					<span className={styles.notiBadge}>3</span>
				</button>

				<button
					className={styles.iconBtn}
					title="다크모드"
					onClick={onToggleDark}
				>
					{isDark ? "☀" : "◑"}
				</button>

				<button className={styles.iconBtn} title={user?.name}>
					<span className={styles.avatar}>{user?.avatar}</span>
				</button>
			</div>
		</header>
	);
}

export default Topbar;
