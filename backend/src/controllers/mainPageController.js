import { supabase } from "../lib/supabase.js";

const SECTION_LIMITS = {
  headline:    1,
  featured:    3,
  recommended: 6,
};

// GET /main-page
export async function getMainPage(_req, res) {
  const { data, error } = await supabase
    .from("main_page_config")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // 초기 데이터 없으면 기본 구조 반환
    return res.json({
      sections: [
        { id: "headline",    label: "헤드라인",  maxSlots: 1, articles: [] },
        { id: "featured",    label: "특집 기사", maxSlots: 3, articles: [] },
        { id: "recommended", label: "추천 기사", maxSlots: 6, articles: [] },
      ],
    });
  }

  return res.json(data);
}

// PUT /main-page
export async function updateMainPage(req, res) {
  const { sections } = req.body;

  if (!sections || !Array.isArray(sections)) {
    return res.status(400).json({ message: "sections 배열이 필요합니다." });
  }

  for (const section of sections) {
    const maxSlots = SECTION_LIMITS[section.id];
    if (maxSlots !== undefined && section.articles.length > maxSlots) {
      return res.status(400).json({
        message: `'${section.label}' 섹션은 최대 ${maxSlots}개까지 배치할 수 있습니다.`,
      });
    }
  }

  const { data, error } = await supabase
    .from("main_page_config")
    .insert({
      sections,
      updated_by: req.user?.id || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
}
