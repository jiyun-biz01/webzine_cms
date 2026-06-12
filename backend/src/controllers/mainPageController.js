import mainPage from "../data/mainPage.js";

// ============================================
// mainPageController - 메인 페이지 구성 관련 로직
// ============================================

// 현재 메인 페이지 구성 조회
// GET /main-page
export function getMainPage(_req, res) {
  return res.json(mainPage);
}

// 메인 페이지 구성 저장
// PUT /main-page
// Body: { sections: [...] }
export function updateMainPage(req, res) {
  const { sections } = req.body;

  if (!sections || !Array.isArray(sections)) {
    return res.status(400).json({ message: "sections 배열이 필요합니다." });
  }

  // 각 섹션의 maxSlots를 초과하지 않는지 검증
  for (const incoming of sections) {
    const original = mainPage.sections.find((s) => s.id === incoming.id);
    if (!original) {
      return res.status(400).json({ message: `알 수 없는 섹션: ${incoming.id}` });
    }
    if (incoming.articles.length > original.maxSlots) {
      return res.status(400).json({
        message: `'${original.label}' 섹션은 최대 ${original.maxSlots}개까지 배치할 수 있습니다.`,
      });
    }
  }

  // 저장 (목업: 메모리 업데이트 - 서버 재시작 시 초기화됨)
  mainPage.sections = sections.map((incoming) => {
    const original = mainPage.sections.find((s) => s.id === incoming.id);
    return { ...original, articles: incoming.articles };
  });

  return res.json(mainPage);
}
