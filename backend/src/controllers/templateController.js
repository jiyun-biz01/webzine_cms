import templates from "../data/templates.js";

// ============================================
// templateController - 디자인 템플릿 관련 로직
//
// 템플릿의 레이아웃 디자인(CSS)은 프론트엔드에서 관리합니다.
// 여기서는 템플릿의 메타 정보(이름, 슬롯 수 등)만 다룹니다.
//
// 실제 DB 연동 시:
//   templates 배열 → ORM 쿼리로 교체
// ============================================

// ── 템플릿 목록 조회 ───────────────────────────
// GET /templates
export function getTemplates(req, res) {
  return res.json(templates);
}

// ── 템플릿 단건 조회 ───────────────────────────
// GET /templates/:id
export function getTemplate(req, res) {
  const template = templates.find((t) => t.id === parseInt(req.params.id));

  if (!template) {
    return res.status(404).json({ message: "템플릿을 찾을 수 없습니다." });
  }

  return res.json(template);
}

// ── 템플릿 생성 ────────────────────────────────
// POST /templates
export function createTemplate(req, res) {
  const { name, description, layoutType, imageSlots, slotLabels } = req.body;

  if (!name || !layoutType) {
    return res.status(400).json({ message: "이름과 레이아웃 타입은 필수입니다." });
  }

  const newId = templates.length > 0 ? Math.max(...templates.map((t) => t.id)) + 1 : 1;

  const newTemplate = {
    id: newId,
    name,
    description: description || "",
    layoutType,
    imageSlots: imageSlots ?? 0,
    slotLabels: slotLabels ?? [],
  };

  templates.push(newTemplate);

  return res.status(201).json(newTemplate);
}

// ── 템플릿 수정 ────────────────────────────────
// PUT /templates/:id
export function updateTemplate(req, res) {
  const idx = templates.findIndex((t) => t.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ message: "템플릿을 찾을 수 없습니다." });
  }

  templates[idx] = { ...templates[idx], ...req.body, id: templates[idx].id };

  return res.json(templates[idx]);
}

// ── 템플릿 삭제 ────────────────────────────────
// DELETE /templates/:id
export function deleteTemplate(req, res) {
  const idx = templates.findIndex((t) => t.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ message: "템플릿을 찾을 수 없습니다." });
  }

  templates.splice(idx, 1);

  return res.status(204).send();
}
