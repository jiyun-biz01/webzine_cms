import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as notificationService from "@/services/notificationService";
import styles from "./NotificationDropdown.module.css";

const TYPE_ICON = {
	new_subscriber:      "👤",
	subscriber_cancelled: "🚫",
	article_published:   "📰",
};

function timeAgo(dateStr) {
	const diff = Date.now() - new Date(dateStr).getTime();
	const m = Math.floor(diff / 60000);
	if (m < 1)  return "방금 전";
	if (m < 60) return `${m}분 전`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}시간 전`;
	return `${Math.floor(h / 24)}일 전`;
}

function NotificationDropdown() {
	const navigate = useNavigate();
	const [open, setOpen]               = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const ref = useRef(null);

	const load = async () => {
		try {
			const { data, unreadCount } = await notificationService.getNotifications();
			setNotifications(data);
			setUnreadCount(unreadCount);
		} catch {}
	};

	useEffect(() => {
		load();
		const interval = setInterval(load, 30000); // 30초마다 갱신
		return () => clearInterval(interval);
	}, []);

	// 바깥 클릭 시 닫기
	useEffect(() => {
		function handleClick(e) {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const handleOpen = () => {
		setOpen((prev) => !prev);
	};

	const handleClickItem = async (noti) => {
		if (!noti.is_read) {
			await notificationService.markAsRead(noti.id);
			setNotifications((prev) =>
				prev.map((n) => n.id === noti.id ? { ...n, is_read: true } : n),
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		}
		if (noti.link) {
			navigate(noti.link);
			setOpen(false);
		}
	};

	const handleMarkAll = async () => {
		await notificationService.markAllAsRead();
		setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
		setUnreadCount(0);
	};

	return (
		<div className={styles.wrap} ref={ref}>
			<button className={styles.bell} onClick={handleOpen} title="알림">
				🔔
				{unreadCount > 0 && (
					<span className={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
				)}
			</button>

			{open && (
				<div className={styles.dropdown}>
					<div className={styles.header}>
						<span className={styles.title}>알림</span>
						{unreadCount > 0 && (
							<button className={styles.readAll} onClick={handleMarkAll}>
								전체 읽음
							</button>
						)}
					</div>

					<div className={styles.list}>
						{notifications.length === 0 ? (
							<p className={styles.empty}>새로운 알림이 없습니다.</p>
						) : (
							notifications.map((noti) => (
								<div
									key={noti.id}
									className={`${styles.item} ${!noti.is_read ? styles.unread : ""}`}
									onClick={() => handleClickItem(noti)}
								>
									<span className={styles.icon}>{TYPE_ICON[noti.type] ?? "🔔"}</span>
									<div className={styles.content}>
										<p className={styles.message}>{noti.message}</p>
										<span className={styles.time}>{timeAgo(noti.created_at)}</span>
									</div>
									{!noti.is_read && <span className={styles.dot} />}
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default NotificationDropdown;
