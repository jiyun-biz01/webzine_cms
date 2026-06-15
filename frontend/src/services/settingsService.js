import api from "@/api/axios";

export async function getSettings() {
	const response = await api.get("/settings");
	return response.data;
}

export async function updateSettings(data) {
	const response = await api.put("/settings", data);
	return response.data;
}

export async function changePassword(data) {
	const response = await api.put("/auth/password", data);
	return response.data;
}
