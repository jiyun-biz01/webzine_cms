import { supabase } from "../lib/supabase.js";
import { createNotification } from "./notificationController.js";

// GET /webzine/history
export async function getHistory(_req, res) {
  const { data, error } = await supabase
    .from("webzine_history")
    .select("*")
    .order("issue", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ data, total: data.length });
}

// POST /webzine/send
export async function sendWebzine(req, res) {
  const { yearMonth, articleCount } = req.body;

  if (!yearMonth) return res.status(400).json({ message: "발행 연월을 입력해주세요." });

  // 최신 회차 조회 후 +1
  const { data: latest } = await supabase
    .from("webzine_history")
    .select("issue")
    .order("issue", { ascending: false })
    .limit(1)
    .single();

  const issue = (latest?.issue ?? 0) + 1;

  const { data, error } = await supabase
    .from("webzine_history")
    .insert({
      issue,
      year_month:    yearMonth,
      article_count: articleCount ?? 0,
      sent_at:       new Date().toISOString(),
      status:        "sent",
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  createNotification({
    type:    "webzine_sent",
    message: `Vol.${issue} 웹진이 발송되었습니다. (${yearMonth})`,
    link:    "/main-page/history",
  });

  return res.status(201).json(data);
}

// GET /webzine/history/:id
export async function getHistoryItem(req, res) {
  const { data: item, error } = await supabase
    .from("webzine_history")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !item) {
    return res.status(404).json({ message: "해당 웹진 이력을 찾을 수 없습니다." });
  }

  return res.json(item);
}
