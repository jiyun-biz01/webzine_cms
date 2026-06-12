import { useState, useEffect } from "react";
import ContentHeader from "@/components/layout/ContentHeader";
import ArticlePickerModal from "@/components/common/ArticlePickerModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MainPagePreview from "./MainPagePreview";
import * as mainPageService from "@/services/mainPageService";
import styles from "./MainPageConfig.module.css";

// ============================================
// MainPageConfig - 웹진 메인 페이지 구성 편집 페이지
//
// 동작 방식:
//   1. 서버에서 현재 메인 페이지 구성을 불러옴
//   2. 편집자가 슬롯에 기사를 배치/제거
//   3. [저장하기] 클릭 시 서버에 반영
//
// sections 상태는 서버 데이터를 로컬에 복사해서 편집하고,
// 저장 시에만 서버로 보냅니다. (로컬 우선 편집 패턴)
// ============================================

function MainPageConfig() {
  const [sections, setSections] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [view, setView]         = useState("config"); // "config" | "preview"

  // 모달 상태: 어느 섹션의 몇 번째 슬롯에 추가하는지 추적
  const [picker, setPicker] = useState(null); // { sectionId, slotIndex } | null

  // 서버에서 초기 구성 불러오기
  useEffect(() => {
    mainPageService.getMainPage()
      .then((data) => setSections(data.sections))
      .finally(() => setLoading(false));
  }, []);

  // ── 기사 추가 ─────────────────────────────────
  const handleAddArticle = (sectionId, slotIndex) => {
    setPicker({ sectionId, slotIndex });
  };

  // 모달에서 기사 선택 시
  const handleArticleSelect = (article) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== picker.sectionId) return section;

        const next = [...section.articles];
        // slotIndex 위치에 기사 삽입 (빈 슬롯 채우기)
        next[picker.slotIndex] = {
          id:       article.id,
          title:    article.title,
          category: article.category,
          author:   article.author,
          date:     article.date,
        };
        return { ...section, articles: next };
      }),
    );
    setSaved(false);
  };

  // ── 기사 제거 ─────────────────────────────────
  const handleRemoveArticle = (sectionId, articleIndex) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        const next = section.articles.filter((_, i) => i !== articleIndex);
        return { ...section, articles: next };
      }),
    );
    setSaved(false);
  };

  // ── 저장 ──────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await mainPageService.updateMainPage(sections);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // 3초 후 피드백 사라짐
    } catch (err) {
      alert(err.response?.data?.message ?? "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 현재 구성에서 이미 배치된 기사 id 목록 (중복 배치 방지)
  const allPlacedIds = sections
    ? sections.flatMap((s) => s.articles.map((a) => a.id))
    : [];

  return (
    <>
      <ContentHeader
        breadcrumb={["홈", "메인 페이지 구성"]}
        title="메인 페이지 구성"
        subTitle="웹진 메인 페이지에 표출할 기사를 선택하고 배치합니다."
        actions={[
          {
            label: saving ? "저장 중..." : saved ? "저장됨 ✓" : "저장하기",
            variant: saved ? "btn-success" : "btn-primary",
            onClick: handleSave,
            disabled: saving || !sections,
          },
        ]}
      />

      {/* 구성 편집 / 미리보기 탭 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${view === "config" ? styles.tabActive : ""}`}
          onClick={() => setView("config")}
        >
          구성 편집
        </button>
        <button
          className={`${styles.tab} ${view === "preview" ? styles.tabActive : ""}`}
          onClick={() => setView("preview")}
        >
          미리보기
        </button>
      </div>

      {/* 미리보기 모드 */}
      {view === "preview" && <MainPagePreview sections={sections} />}

      {/* 구성 편집 모드 */}
      <div className={styles.body} style={{ display: view === "config" ? "flex" : "none" }}>
        {loading && <LoadingSpinner />}

        {!loading && sections && sections.map((section) => (
          <div key={section.id} className="card">
            <div className="card-header">
              <h3>{section.label}</h3>
              <span className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>
                {section.articles.length} / {section.maxSlots}자리
              </span>
            </div>

            <div className="card-body">
              <div
                className={styles.slotGrid}
                style={{
                  // 섹션별로 열 수를 다르게
                  gridTemplateColumns:
                    section.maxSlots === 1 ? "1fr" :
                    section.maxSlots <= 3  ? "repeat(3, 1fr)" :
                                             "repeat(3, 1fr)",
                }}
              >
                {/* maxSlots 만큼 슬롯 렌더링 */}
                {Array.from({ length: section.maxSlots }).map((_, slotIdx) => {
                  const article = section.articles[slotIdx];
                  return article
                    ? (
                      // 기사가 배치된 슬롯
                      <div key={slotIdx} className={styles.slotFilled}>
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemoveArticle(section.id, slotIdx)}
                          title="제거"
                        >
                          ✕
                        </button>
                        <span className="badge badge-info">{article.category}</span>
                        <p className={styles.slotTitle}>{article.title}</p>
                        <span className={styles.slotMeta}>
                          {article.author} · {article.date}
                        </span>
                      </div>
                    )
                    : (
                      // 빈 슬롯
                      <button
                        key={slotIdx}
                        className={styles.slotEmpty}
                        onClick={() => handleAddArticle(section.id, slotIdx)}
                      >
                        <span className={styles.addIcon}>+</span>
                        <span>기사 선택</span>
                      </button>
                    );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 기사 선택 모달 */}
      <ArticlePickerModal
        isOpen={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={handleArticleSelect}
        excludeIds={allPlacedIds}
      />
    </>
  );
}

export default MainPageConfig;
