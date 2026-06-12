import { supabase } from "../lib/supabase.js";

// GET /webzine/history
export async function getHistory(_req, res) {
  const { data, error } = await supabase
    .from("webzine_history")
    .select("*")
    .order("issue", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ data, total: data.length });
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
