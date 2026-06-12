import { supabase } from "../lib/supabase.js";

// GET /templates
export async function getTemplates(_req, res) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .order("id");

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
}

// GET /templates/:id
export async function getTemplate(req, res) {
  const { data: template, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !template) {
    return res.status(404).json({ message: "템플릿을 찾을 수 없습니다." });
  }

  return res.json(template);
}

// POST /templates
export async function createTemplate(req, res) {
  const { name, description, layoutType, imageSlots, slotLabels } = req.body;

  if (!name || !layoutType) {
    return res.status(400).json({ message: "이름과 레이아웃 타입은 필수입니다." });
  }

  const { data: template, error } = await supabase
    .from("templates")
    .insert({
      name,
      description:  description || "",
      layout_type:  layoutType,
      image_slots:  imageSlots ?? 0,
      slot_labels:  slotLabels ?? [],
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.status(201).json(template);
}

// PUT /templates/:id
export async function updateTemplate(req, res) {
  const { name, description, layoutType, imageSlots, slotLabels } = req.body;

  const { data: template, error } = await supabase
    .from("templates")
    .update({
      name,
      description,
      layout_type: layoutType,
      image_slots: imageSlots,
      slot_labels: slotLabels,
    })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !template) {
    return res.status(404).json({ message: "템플릿을 찾을 수 없습니다." });
  }

  return res.json(template);
}

// DELETE /templates/:id
export async function deleteTemplate(req, res) {
  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ message: error.message });
  return res.status(204).send();
}
