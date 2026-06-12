import { useAuth } from "@/context/AuthContext";
import MenuItem from "./MenuItem";
import menuData from "@/data/menuData";
import styles from "./Sidebar.module.css";

function Sidebar({ isCollapsed, onToggle }) {
	const { user, logout } = useAuth();

	return (
		<aside
			className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
		>
			{/* 로고 */}
			<div className={styles.logo}>
				<span className={styles.logoMark}>M</span>
				{!isCollapsed && (
					<span className={styles.logoText}>WEBZINE</span>
				)}
				<button className={styles.collapseBtn} onClick={onToggle}>
					{isCollapsed ? "›" : "‹"}
				</button>
			</div>

			{/* 유저 프로필 - 펼쳐진 상태 */}
			{!isCollapsed && user && (
				<div className={styles.userProfile}>
					<div className={styles.userAvatar}>{user.avatar}</div>
					<div className={styles.userInfo}>
						<strong className={styles.userName}>{user.name}</strong>
						<span className={styles.userRole}>{user.role}</span>
						<span className={styles.userId}>@{user.id}</span>
					</div>
				</div>
			)}

			{/* 유저 아바타 - 접힌 상태 */}
			{isCollapsed && user && (
				<div className={styles.userAvatarCollapsed} title={user.name}>
					{user.avatar}
				</div>
			)}

			{/* 메뉴 */}
			<nav className={styles.nav}>
				<ul className={styles.menuList}>
					{menuData.map((item) => (
						<MenuItem
							key={item.id}
							item={item}
							depth={0}
						/>
					))}
				</ul>
			</nav>

			{/* 하단 */}
			{!isCollapsed && user && (
				<div className={styles.footer}>
					<span className={styles.lastLogin}>
						최근 접속 {user.lastLogin}
					</span>
					<button className={styles.logoutBtn} onClick={logout}>
						로그아웃
					</button>
				</div>
			)}
		</aside>
	);
}

export default Sidebar;
