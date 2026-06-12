// ============================================
// 목업 템플릿 데이터
//
// layoutType 값이 프론트엔드 TemplateRenderer와 1:1 매핑됩니다.
// 새 레이아웃 추가 시:
//   1. 여기에 항목 추가
//   2. 프론트엔드 components/templates/ 에 컴포넌트 추가
//   3. TemplateRenderer.jsx 의 MAP 에 등록
//
// imageSlots: 이 템플릿이 사용하는 이미지 슬롯 수
// slotLabels: 각 슬롯의 UI 표시명 (순서 = slot 번호)
// ============================================

const templates = [
  {
    id: 1,
    name: "기본형",
    description: "이미지 없이 제목과 본문만 표시합니다.",
    layoutType: "basic",
    imageSlots: 0,
    slotLabels: [],
  },
  {
    id: 2,
    name: "이미지 상단형",
    description: "대표 이미지가 상단에, 본문이 아래에 배치됩니다.",
    layoutType: "image-top",
    imageSlots: 1,
    slotLabels: ["대표 이미지"],
  },
  {
    id: 3,
    name: "좌측 이미지형",
    description: "이미지가 좌측, 본문이 우측에 나란히 배치됩니다.",
    layoutType: "image-left",
    imageSlots: 1,
    slotLabels: ["좌측 이미지"],
  },
  {
    id: 4,
    name: "우측 이미지형",
    description: "본문이 좌측, 이미지가 우측에 나란히 배치됩니다.",
    layoutType: "image-right",
    imageSlots: 1,
    slotLabels: ["우측 이미지"],
  },
  {
    id: 5,
    name: "2단 이미지형",
    description: "이미지 2개가 나란히, 본문이 아래에 배치됩니다.",
    layoutType: "image-2col",
    imageSlots: 2,
    slotLabels: ["이미지 1", "이미지 2"],
  },
  {
    id: 6,
    name: "매거진형",
    description: "상단 대표 이미지, 본문, 하단 보조 이미지 2개로 구성됩니다.",
    layoutType: "magazine",
    imageSlots: 3,
    slotLabels: ["대표 이미지", "보조 이미지 1", "보조 이미지 2"],
  },
];

export default templates;
