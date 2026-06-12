import { useState, useEffect } from "react";
import ContentHeader from "@/components/layout/ContentHeader";
import * as templateService from "@/services/templateService";
import styles from "./TemplateList.module.css";

// ============================================
// TemplateList - 디자인 템플릿 관리 페이지
//
// - 템플릿 목록 카드 형태로 표시
// - 신규 등록 / 수정 / 삭제 기능
// - layoutType은 프론트엔드 TemplateRenderer와 연결됨
//   → 실제 레이아웃 디자인은 components/templates/ 에서 관리
// ============================================

// 현재 프론트엔드에 구현된 레이아웃 타입 목록
// 디자이너가 새 레이아웃 추가 시 여기도 업데이트
const LAYOUT_OPTIONS = [
  { value: "basic",       label: "기본형",        imageSlots: 0 },
  { value: "image-top",   label: "이미지 상단형",  imageSlots: 1 },
  { value: "image-left",  label: "좌측 이미지형",  imageSlots: 1 },
  { value: "image-right", label: "우측 이미지형",  imageSlots: 1 },
  { value: "image-2col",  label: "2단 이미지형",   imageSlots: 2 },
  { value: "magazine",    label: "매거진형",       imageSlots: 3 },
];

// slotLabels 기본값: layoutType 선택 시 자동으로 채워줌
const DEFAULT_SLOT_LABELS = {
  "basic":       [],
  "image-top":   ["대표 이미지"],
  "image-left":  ["좌측 이미지"],
  "image-right": ["우측 이미지"],
  "image-2col":  ["이미지 1", "이미지 2"],
  "magazine":    ["대표 이미지", "보조 이미지 1", "보조 이미지 2"],
};

const EMPTY_FORM = {
  name: "",
  description: "",
  layoutType: "basic",
  imageSlots: 0,
  slotLabels: [],
};

function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // 폼 상태 (null이면 폼 숨김, 객체면 표시)
  const [formMode, setFormMode]   = useState(null); // "create" | "edit"
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch {
      setError("템플릿 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // layoutType 변경 시 imageSlots, slotLabels 자동 세팅
  function handleLayoutChange(layoutType) {
    const option = LAYOUT_OPTIONS.find((o) => o.value === layoutType);
    setForm((prev) => ({
      ...prev,
      layoutType,
      imageSlots: option?.imageSlots ?? 0,
      slotLabels: DEFAULT_SLOT_LABELS[layoutType] ?? [],
    }));
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormMode("create");
    setEditId(null);
    setFormError(null);
  }

  function openEdit(template) {
    setForm({
      name:        template.name,
      description: template.description,
      layoutType:  template.layoutType,
      imageSlots:  template.imageSlots,
      slotLabels:  template.slotLabels,
    });
    setFormMode("edit");
    setEditId(template.id);
    setFormError(null);
  }

  function closeForm() {
    setFormMode(null);
    setEditId(null);
    setFormError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("템플릿 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (formMode === "create") {
        await templateService.createTemplate(form);
      } else {
        await templateService.updateTemplate(editId, form);
      }
      await load();
      closeForm();
    } catch {
      setFormError("저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("이 템플릿을 삭제하시겠습니까?")) return;
    try {
      await templateService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("삭제에 실패했습니다.");
    }
  }

  if (loading) return null;

  return (
    <>
      <ContentHeader
        breadcrumb={["홈", "디자인 템플릿"]}
        title="디자인 템플릿"
        subTitle="기사에 적용할 레이아웃 템플릿을 관리합니다."
      />

      <div className={styles.body}>

        {/* 상단 액션 */}
        <div className={styles.toolbar}>
          <span className={styles.count}>총 {templates.length}개</span>
          <button className="btn btn-primary" onClick={openCreate}>
            + 템플릿 등록
          </button>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        {/* 템플릿 카드 목록 */}
        <div className={styles.grid}>
          {templates.map((t) => (
            <div key={t.id} className={styles.card}>
              {/* 레이아웃 미리보기 아이콘 영역 */}
              <div className={`${styles.preview} ${styles[`preview_${t.layoutType.replace("-", "_")}`]}`}>
                <LayoutIcon layoutType={t.layoutType} />
              </div>

              <div className={styles.cardBody}>
                <h4 className={styles.cardName}>{t.name}</h4>
                <p className={styles.cardDesc}>{t.description}</p>
                <div className={styles.cardMeta}>
                  <span className={styles.badge}>{t.layoutType}</span>
                  <span className={styles.slotCount}>이미지 {t.imageSlots}개</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>수정</button>
                <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(t.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>

        {/* 등록/수정 폼 (모달처럼 오버레이) */}
        {formMode && (
          <div className={styles.overlay} onClick={closeForm}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>
                {formMode === "create" ? "템플릿 등록" : "템플릿 수정"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">템플릿 이름 *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="예: 매거진형 A"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">설명</label>
                  <input
                    className="form-input"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="템플릿 설명 (선택)"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">레이아웃 타입 *</label>
                  <select
                    className="form-select"
                    value={form.layoutType}
                    onChange={(e) => handleLayoutChange(e.target.value)}
                  >
                    {LAYOUT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className={styles.hint}>이미지 슬롯 수: {form.imageSlots}개</p>
                </div>

                {formError && <p className={styles.formError}>{formError}</p>}

                <div className={styles.modalActions}>
                  <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={submitting}>
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "저장 중..." : "저장"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ── 레이아웃 타입별 아이콘 (SVG 도식) ────────────
// 디자이너가 실제 썸네일 이미지로 교체 가능
function LayoutIcon({ layoutType }) {
  const icons = {
    "basic": (
      <svg viewBox="0 0 80 60" className={styles.iconSvg}>
        <rect x="5" y="5"  width="70" height="10" rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="5" y="20" width="70" height="6"  rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="5" y="30" width="70" height="6"  rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="5" y="40" width="50" height="6"  rx="2" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
    "image-top": (
      <svg viewBox="0 0 80 60" className={styles.iconSvg}>
        <rect x="5" y="5"  width="70" height="25" rx="2" fill="currentColor" opacity="0.4"/>
        <rect x="5" y="35" width="70" height="5"  rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="5" y="44" width="70" height="4"  rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="5" y="52" width="40" height="4"  rx="2" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
    "image-left": (
      <svg viewBox="0 0 80 60" className={styles.iconSvg}>
        <rect x="5"  y="5" width="30" height="50" rx="2" fill="currentColor" opacity="0.4"/>
        <rect x="40" y="5"  width="35" height="7" rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="40" y="17" width="35" height="5" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="40" y="26" width="35" height="5" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="40" y="35" width="25" height="5" rx="2" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
    "image-right": (
      <svg viewBox="0 0 80 60" className={styles.iconSvg}>
        <rect x="5"  y="5"  width="35" height="7" rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="5"  y="17" width="35" height="5" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="5"  y="26" width="35" height="5" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="5"  y="35" width="25" height="5" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="45" y="5"  width="30" height="50" rx="2" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
    "image-2col": (
      <svg viewBox="0 0 80 60" className={styles.iconSvg}>
        <rect x="5"  y="5" width="33" height="25" rx="2" fill="currentColor" opacity="0.4"/>
        <rect x="42" y="5" width="33" height="25" rx="2" fill="currentColor" opacity="0.4"/>
        <rect x="5"  y="35" width="70" height="5" rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="5"  y="44" width="70" height="4" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="5"  y="52" width="40" height="4" rx="2" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
    "magazine": (
      <svg viewBox="0 0 80 60" className={styles.iconSvg}>
        <rect x="5"  y="5"  width="70" height="20" rx="2" fill="currentColor" opacity="0.4"/>
        <rect x="5"  y="30" width="70" height="5"  rx="2" fill="currentColor" opacity="0.7"/>
        <rect x="5"  y="39" width="70" height="3"  rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="5"  y="46" width="33" height="10" rx="2" fill="currentColor" opacity="0.4"/>
        <rect x="42" y="46" width="33" height="10" rx="2" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
  };
  return icons[layoutType] ?? icons["basic"];
}

export default TemplateList;
