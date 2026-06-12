import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useTheme } from "@/hooks/useTheme";
import styles from "./AppLayout.module.css";

function AppLayout({ children }) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { isDark, toggle } = useTheme();

	return (
		<div className={`${styles.appShell} ${isDark ? "dark" : ""}`}>
			<Sidebar
				isCollapsed={isCollapsed}
				onToggle={() => setIsCollapsed((prev) => !prev)}
			/>

			<div
				className={`${styles.mainWrapper} ${isCollapsed ? styles.collapsed : ""}`}
			>
				<Topbar isDark={isDark} onToggleDark={toggle} />

				<main className={styles.contentArea}>{children}</main>
			</div>
		</div>
	);
}

export default AppLayout;
