import { supabase } from "../lib/supabase.js";

function toClient(c) {
  return {
    id:        c.id,
    name:      c.name,
    sortOrder: c.sort_order,
    createdAt: c.created_at,
  };
}

// GET /categories
export async function getCategories(_req, res) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data.map(toClient));
}

// POST /categories
export async function createCategory(req, res) {
  const { name, sortOrder } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "카테고리 이름을 입력해주세요." });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: name.trim(), sort_order: sortOrder ?? 0 })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "이미 존재하는 카테고리 이름입니다." });
    }
    return res.status(500).json({ message: error.message });
  }

  return res.status(201).json(toClient(data));
}

// PUT /categories/:id
export async function updateCategory(req, res) {
  const { name, sortOrder } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "카테고리 이름을 입력해주세요." });
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ name: name.trim(), sort_order: sortOrder ?? 0 })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
  }

  return res.json(toClient(data));
}

// DELETE /categories/:id
export async function deleteCategory(req, res) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ message: error.message });
  return res.status(204).send();
}
