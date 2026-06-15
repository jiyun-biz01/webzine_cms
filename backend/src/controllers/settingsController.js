import { supabase } from "../lib/supabase.js";

// GET /settings
export async function getSettings(_req, res) {
  const { data, error } = await supabase
    .from("settings")
    .select("data")
    .eq("id", 1)
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data?.data ?? {});
}

// PUT /settings
export async function updateSettings(req, res) {
  const { data: current, error: fetchError } = await supabase
    .from("settings")
    .select("data")
    .eq("id", 1)
    .single();

  if (fetchError) return res.status(500).json({ message: fetchError.message });

  const merged = { ...(current?.data ?? {}), ...req.body };

  const { error } = await supabase
    .from("settings")
    .update({ data: merged, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return res.status(500).json({ message: error.message });
  return res.json(merged);
}
