import api from "@/api/axios";

export async function getNotifications() {
	const response = await api.get("/notifications");
	return response.data; // { data: [...], unreadCount: N }
}

export async function markAsRead(id) {
	await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead() {
	await api.patch("/notifications/read-all");
}
