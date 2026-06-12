import styles from "./templates.module.css";

// ============================================
// TemplateRenderer - 기사를 템플릿 레이아웃으로 렌더링
//
// [디자이너 가이드]
//   레이아웃을 변경하려면 templates.module.css 만 수정하면 됩니다.
//   이 파일(TemplateRenderer.jsx)의 구조(클래스명)는 그대로 두고
//   CSS만 편집하세요.
//
//   새 레이아웃 추가 시:
//     1. templates.module.css 에 .layout_새타입 클래스 추가
//     2. 아래 LAYOUTS 맵에 새 layoutType 항목 추가
//     3. backend/src/data/templates.js 에 데이터 추가
//     4. TemplateList.jsx 의 LAYOUT_OPTIONS 에 추가
//
// Props:
//   article  - { title, content, category, templateId, images }
//   template - { layoutType, slotLabels, imageSlots }
// ============================================

// layoutType → CSS 모듈 클래스명 매핑
const LAYOUTS = {
  "basic":       "layout_basic",
  "image-top":   "layout_image_top",
  "image-left":  "layout_image_left",
  "image-right": "layout_image_right",
  "image-2col":  "layout_image_2col",
  "magazine":    "layout_magazine",
};

function TemplateRenderer({ article, template }) {
  if (!article) return null;

  // 템플릿이 없으면 기본형으로 렌더링
  const layoutType  = template?.layoutType ?? "basic";
  const layoutClass = LAYOUTS[layoutType] ?? LAYOUTS["basic"];

  // slot 번호(1부터 시작) → 이미지 URL 조회
  const getImage = (slot) => {
    const found = article.images?.find((img) => img.slot === slot);
    return found?.url || null;
  };

  return (
    <article className={`${styles.article} ${styles[layoutClass]}`}>

      {/* ── 카테고리 태그 ─────────────────────── */}
      {article.category && (
        <span className={styles.category}>{article.category}</span>
      )}

      {/* ── 제목 ──────────────────────────────── */}
      <h1 className={styles.title}>{article.title}</h1>

      {/* ── 이미지 슬롯 영역들 ────────────────── */}
      {/* 각 슬롯은 layoutType에 따라 CSS로 위치가 결정됨 */}
      {(template?.imageSlots ?? 0) > 0 && (
        <>
          {Array.from({ length: template.imageSlots }, (_, i) => i + 1).map((slot) => {
            const url = getImage(slot);
            return (
              <div key={slot} className={`${styles.imageSlot} ${styles[`slot_${slot}`]}`}>
                {url ? (
                  <img src={url} alt={template.slotLabels?.[slot - 1] ?? `이미지 ${slot}`} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>{template.slotLabels?.[slot - 1] ?? `이미지 ${slot}`}</span>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── 본문 ──────────────────────────────── */}
      <div className={styles.content}>
        {/* 줄바꿈(\n)을 <br>로 변환해서 표시 */}
        {article.content?.split("\n").map((line, i) => (
          <p key={i}>{line || "\u00A0"}</p>
        ))}
      </div>

    </article>
  );
}

export default TemplateRenderer;
