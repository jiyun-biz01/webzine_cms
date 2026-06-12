import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import * as articleService from "@/services/articleService";
import * as templateService from "@/services/templateService";
import styles from "./ArticlePreview.module.css";

// ============================================
// ArticlePreview - 기사 미리보기 페이지 (새 창)
//
// - 사이드바/탑바 없이 순수 기사 레이아웃만 표시
// - 상단에 뷰포트 토글(데스크탑/태블릿/모바일) 제공
// - 새로고침해도 서버에서 데이터를 다시 불러옴
// - 이 페이지는 ProtectedLayout 밖에 있어 레이아웃 없이 렌더링됨
//
// URL: /articles/preview/:id
// ============================================

// 뷰포트 미리보기 크기 설정
const VIEWPORTS = [
  { key: "desktop", label: "데스크탑", icon: "⬛", width: "100%" },
  { key: "tablet",  label: "태블릿",   icon: "▭",  width: "768px" },
  { key: "mobile",  label: "모바일",   icon: "▯",  width: "375px" },
];

function ArticlePreview() {
  const { id } = useParams();

  const [article,  setArticle]  = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [viewport, setViewport] = useState("desktop");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const art = await articleService.getArticle(id);
      setArticle(art);

      if (art.templateId) {
        const tmpl = await templateService.getTemplate(art.templateId);
        setTemplate(tmpl);
      } else {
        setTemplate(null);
      }
    } catch {
      setError("기사를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const currentViewport = VIEWPORTS.find((v) => v.key === viewport);

  return (
    <div className={styles.page}>

      {/* ── 미리보기 컨트롤 바 ─────────────────── */}
      <div className={styles.controlBar}>
        <div className={styles.controlLeft}>
          <span className={styles.previewLabel}>미리보기</span>
          {article && (
            <span className={styles.articleTitle}>{article.title}</span>
          )}
        </div>

        <div className={styles.viewportToggle}>
          {VIEWPORTS.map((v) => (
            <button
              key={v.key}
              className={`${styles.vpBtn} ${viewport === v.key ? styles.vpBtnActive : ""}`}
              onClick={() => setViewport(v.key)}
              title={v.label}
            >
              <span className={styles.vpIcon}>{v.icon}</span>
              <span className={styles.vpLabel}>{v.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.controlRight}>
          <button className={styles.refreshBtn} onClick={load} title="새로고침">
            ↺ 새로고침
          </button>
          <button className={styles.closeBtn} onClick={() => window.close()}>
            닫기
          </button>
        </div>
      </div>

      {/* ── 미리보기 영역 ──────────────────────── */}
      <div className={styles.previewArea}>
        {loading && (
          <div className={styles.state}>불러오는 중...</div>
        )}
        {error && (
          <div className={styles.stateError}>{error}</div>
        )}
        {!loading && !error && article && (
          /* 뷰포트 너비를 인라인으로 적용해 반응형 확인 */
          <div
            className={styles.viewport}
            style={{ width: currentViewport.width }}
          >
            <TemplateRenderer article={article} template={template} />
          </div>
        )}
      </div>

    </div>
  );
}

export default ArticlePreview;
