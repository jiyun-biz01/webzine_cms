// ============================================
// mainPage.js - 웹진 메인 페이지 구성 목업 데이터
//
// sections: 메인 페이지의 섹션 목록
//   id       - 고유 식별자
//   label    - 화면에 표시될 섹션 이름
//   maxSlots - 이 섹션에 배치할 수 있는 최대 기사 수
//   articles - 현재 배치된 기사 목록 (빈 배열이면 미배치)
// ============================================

const mainPage = {
  sections: [
    {
      id: "headline",
      label: "헤드라인",
      maxSlots: 1,
      articles: [
        {
          id: 1,
          title: "2025 트렌드 분석 리포트",
          category: "산업",
          author: "김편집",
          date: "2025.05.05",
        },
      ],
    },
    {
      id: "featured",
      label: "특집 기사",
      maxSlots: 3,
      articles: [
        { id: 5, title: "AI 기술 동향 2025", category: "테크", author: "김편집", date: "2025.05.03" },
      ],
    },
    {
      id: "recommended",
      label: "추천 기사",
      maxSlots: 6,
      articles: [],
    },
  ],
};

export default mainPage;
