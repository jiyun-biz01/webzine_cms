import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import * as articleService from "@/services/articleService";
import * as templateService from "@/services/templateService";
import styles from "./ArticleWrite.module.css";

// ============================================
// ArticleWrite - 기사 작성 / 편집 페이지
//
// /articles/write       → 신규 작성 모드
// /articles/edit/:id    → 기존 기사 편집 모드
//
// 저장 방식:
//   [임시저장] → status: "draft"  로 저장
//   [발행하기] → status: "published" 로 저장
//
// 디자인 템플릿:
//   사이드바에서 템플릿 선택 → 슬롯 수만큼 이미지 업로드 영역 표시
//   이미지는 먼저 서버에 업로드 후 URL을 저장 (기사 저장과 분리)
// ============================================

const CATEGORIES = ["산업", "비즈니스", "경제", "경영", "테크", "문화", "사회"];

// 이미지 슬롯 초기 상태 생성 헬퍼
// slotLabels 배열로부터 { slot, url, name, uploading, previewUrl } 배열 생성
function makeImageSlots(slotLabels = []) {
  return slotLabels.map((name, i) => ({
    slot: i + 1,
    url: "",
    name,
    uploading: false,
    previewUrl: null, // 로컬 미리보기용 ObjectURL
  }));
}

function ArticleWrite() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);

  // 폼 상태
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status,   setStatus]   = useState("draft");

  // 템플릿 상태
  const [templates,           setTemplates]           = useState([]);
  const [selectedTemplateId,  setSelectedTemplateId]  = useState(null);
  const [imageSlots,          setImageSlots]          = useState([]); // 이미지 슬롯 배열

  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState(null);
  const [loadingInit,   setLoadingInit]   = useState(true);

  // 파일 input ref 배열 (슬롯별로 클릭 트리거용)
  const fileInputRefs = useRef([]);

  // ── 초기 데이터 로드 ─────────────────────────
  useEffect(() => {
    async function init() {
      try {
        // 템플릿 목록은 항상 로드
        const tmplList = await templateService.getTemplates();
        setTemplates(tmplList);

        // 편집 모드: 기존 기사 데이터 로드
        if (isEdit) {
          const article = await articleService.getArticle(id);
          setTitle(article.title ?? "");
          setContent(article.content ?? "");
          setCategory(article.category ?? CATEGORIES[0]);
          setStatus(article.status ?? "draft");

          if (article.templateId) {
            setSelectedTemplateId(article.templateId);
            const tmpl = tmplList.find((t) => t.id === article.templateId);
            if (tmpl) {
              // 기존 이미지 데이터를 슬롯에 채워넣음
              const slots = makeImageSlots(tmpl.slotLabels);
              slots.forEach((slot, i) => {
                const existing = article.images?.find((img) => img.slot === slot.slot);
                if (existing?.url) {
                  slots[i].url        = existing.url;
                  slots[i].previewUrl = existing.url;
                }
              });
              setImageSlots(slots);
            }
          }
        }
      } catch {
        setError("데이터를 불러오지 못했습니다.");
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, [id, isEdit]);

  // ── 템플릿 선택 ──────────────────────────────
  function handleTemplateChange(templateId) {
    const numId = templateId ? parseInt(templateId) : null;
    setSelectedTemplateId(numId);

    if (!numId) {
      setImageSlots([]);
      return;
    }
    const tmpl = templates.find((t) => t.id === numId);
    if (tmpl) {
      setImageSlots(makeImageSlots(tmpl.slotLabels));
    }
  }

  // ── 이미지 파일 선택 → 즉시 업로드 ──────────
  // 파일을 고르는 순간 서버에 업로드하고 URL을 슬롯에 저장
  // 이렇게 하면 저장 버튼 한 번으로 모든 게 완료됨
  async function handleImageChange(slotIndex, file) {
    if (!file) return;

    // 로컬 미리보기 즉시 표시 (업로드 전에 화면에 보여주기)
    const previewUrl = URL.createObjectURL(file);

    setImageSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex ? { ...s, uploading: true, previewUrl } : s,
      ),
    );

    try {
      const { url } = await templateService.uploadImage(file);
      setImageSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex ? { ...s, uploading: false, url } : s,
        ),
      );
    } catch {
      setError("이미지 업로드에 실패했습니다.");
      setImageSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex ? { ...s, uploading: false, previewUrl: null } : s,
        ),
      );
    }
  }

  // ── 이미지 슬롯 초기화 ────────────────────────
  function clearImageSlot(slotIndex) {
    setImageSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex ? { ...s, url: "", previewUrl: null } : s,
      ),
    );
  }

  // ── 저장 공통 핸들러 ─────────────────────────
  const handleSave = async (saveStatus) => {
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("본문 내용을 입력해주세요.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title,
        category,
        content,
        status: saveStatus,
        templateId: selectedTemplateId,
        // 업로드된 URL만 포함 (url이 없는 슬롯은 제외)
        images: imageSlots
          .filter((s) => s.url)
          .map((s) => ({ slot: s.slot, url: s.url, name: s.name })),
      };

      if (isEdit) {
        await articleService.updateArticle(id, payload);
      } else {
        await articleService.createArticle(payload);
      }
      navigate("/articles");
    } catch (err) {
      setError(err.response?.data?.message ?? "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── 미리보기 ─────────────────────────────────
  // draft로 저장 후 새 탭으로 미리보기 페이지 열기
  const handlePreview = async () => {
    if (!title.trim()) {
      setError("미리보기 전에 제목을 입력해주세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title, category, content,
        status: "draft",
        templateId: selectedTemplateId,
        images: imageSlots
          .filter((s) => s.url)
          .map((s) => ({ slot: s.slot, url: s.url, name: s.name })),
      };

      let articleId = id;
      if (isEdit) {
        await articleService.updateArticle(id, payload);
      } else {
        const created = await articleService.createArticle(payload);
        articleId = created.id;
      }
      // 새 탭으로 미리보기 열기
      window.open(`/articles/preview/${articleId}`, "_blank");
    } catch {
      setError("미리보기 준비에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInit) return null;

  return (
    <>
      <ContentHeader
        breadcrumb={["홈", "기사 관리", isEdit ? "기사 편집" : "기사 작성"]}
        title={isEdit ? "기사 편집" : "기사 작성"}
        subTitle={isEdit ? "기존 기사를 수정합니다." : "새 기사를 작성합니다."}
      />

      <div className={styles.body}>
        {/* 제목 입력 */}
        <input
          className={`form-input ${styles.titleInput}`}
          type="text"
          placeholder="기사 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className={styles.columns}>
          {/* ── 왼쪽: 본문 textarea ──────────────── */}
          <div className={styles.editorArea}>
            <textarea
              className={styles.contentTextarea}
              placeholder="기사 본문을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* ── 오른쪽: 설정 사이드바 ────────────── */}
          <aside className={styles.sidebar}>

            {/* 카테고리 */}
            <div className="card">
              <div className={`card-header ${styles.cardHeaderSm}`}>
                <h4>카테고리</h4>
              </div>
              <div className="card-body">
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 디자인 템플릿 선택 */}
            <div className="card">
              <div className={`card-header ${styles.cardHeaderSm}`}>
                <h4>디자인 템플릿</h4>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <select
                    className="form-select"
                    value={selectedTemplateId ?? ""}
                    onChange={(e) => handleTemplateChange(e.target.value || null)}
                  >
                    <option value="">템플릿 없음</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.imageSlots > 0 ? `이미지 ${t.imageSlots}개` : "이미지 없음"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 이미지 슬롯 업로드 영역 */}
                {imageSlots.length > 0 && (
                  <div className={styles.imageSlots}>
                    {imageSlots.map((slot, i) => (
                      <div key={slot.slot} className={styles.imageSlotItem}>
                        <label className={styles.slotLabel}>{slot.name}</label>

                        {/* 이미지 미리보기 or 업로드 버튼 */}
                        {slot.previewUrl ? (
                          <div className={styles.previewWrapper}>
                            <img
                              src={slot.previewUrl}
                              alt={slot.name}
                              className={styles.previewImg}
                            />
                            <button
                              type="button"
                              className={styles.removeBtn}
                              onClick={() => clearImageSlot(i)}
                              title="이미지 제거"
                            >
                              ✕
                            </button>
                            {slot.uploading && (
                              <div className={styles.uploadingOverlay}>업로드 중...</div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => fileInputRefs.current[i]?.click()}
                            disabled={slot.uploading}
                          >
                            {slot.uploading ? "업로드 중..." : "+ 이미지 선택"}
                          </button>
                        )}

                        {/* 실제 파일 input (숨김) */}
                        <input
                          ref={(el) => { fileInputRefs.current[i] = el; }}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageChange(i, e.target.files[0])}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 발행 설정 */}
            <div className="card">
              <div className={`card-header ${styles.cardHeaderSm}`}>
                <h4>발행 설정</h4>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">상태</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="draft">임시저장</option>
                    <option value="published">발행</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && <p className={styles.errorMsg}>{error}</p>}

            {/* 액션 버튼 */}
            <div className={styles.actions}>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                취소
              </button>
              <button
                className="btn btn-info"
                onClick={handlePreview}
                disabled={submitting}
              >
                미리보기
              </button>
              <button
                className="btn btn-warning"
                onClick={() => handleSave("draft")}
                disabled={submitting}
              >
                임시저장
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleSave(status)}
                disabled={submitting}
              >
                {submitting ? "저장 중..." : "발행하기"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default ArticleWrite;
