import { supabase } from "../lib/supabase.js";

// 알림 생성 (내부용 헬퍼 - 다른 컨트롤러에서 호출)
export async function createNotification({ type, message, link = null }) {
  await supabase.from("notifications").insert({ type, message, link });
}

// GET /notifications
export async function getNotifications(_req, res) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return res.status(500).json({ message: error.message });

  const unreadCount = data.filter((n) => !n.is_read).length;
  return res.json({ data, unreadCount });
}

// PATCH /notifications/:id/read
export async function markAsRead(req, res) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ ok: true });
}

// PATCH /notifications/read-all
export async function markAllAsRead(_req, res) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ ok: true });
}
