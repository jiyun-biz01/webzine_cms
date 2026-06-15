import { useState, useEffect } from "react";
import ContentHeader from "@/components/layout/ContentHeader";
import * as categoryService from "@/services/categoryService";
import styles from "./CategoryList.module.css";

const EMPTY_FORM = { name: "", sortOrder: 0 };

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [formMode, setFormMode]     = useState(null); // "create" | "edit"
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      setError("카테고리 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormMode("create");
    setEditId(null);
    setFormError(null);
  }

  function openEdit(cat) {
    setForm({ name: cat.name, sortOrder: cat.sortOrder });
    setFormMode("edit");
    setEditId(cat.id);
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
      setFormError("카테고리 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (formMode === "create") {
        await categoryService.createCategory(form);
      } else {
        await categoryService.updateCategory(editId, form);
      }
      await load();
      closeForm();
    } catch (err) {
      setFormError(err?.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`"${name}" 카테고리를 삭제하시겠습니까?\n해당 카테고리로 등록된 기사는 "미분류"가 됩니다.`)) return;
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("삭제에 실패했습니다.");
    }
  }

  if (loading) return null;

  return (
    <>
      <ContentHeader
        breadcrumb={["홈", "카테고리 관리"]}
        title="카테고리 관리"
        subTitle="기사에 사용할 카테고리를 추가하고 관리합니다."
      />

      <div className={styles.body}>

        <div className={styles.toolbar}>
          <span className={styles.count}>총 {categories.length}개</span>
          <button className="btn btn-primary" onClick={openCreate}>
            + 카테고리 추가
          </button>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>카테고리명</span>
            <span>정렬 순서</span>
            <span>관리</span>
          </div>

          {categories.length === 0 ? (
            <div className={styles.empty}>등록된 카테고리가 없습니다.</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className={styles.tableRow}>
                <span className={styles.name}>{cat.name}</span>
                <span className={styles.sortOrder}>{cat.sortOrder}</span>
                <div className={styles.actions}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>수정</button>
                  <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(cat.id, cat.name)}>삭제</button>
                </div>
              </div>
            ))
          )}
        </div>

        {formMode && (
          <div className={styles.overlay} onClick={closeForm}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>
                {formMode === "create" ? "카테고리 추가" : "카테고리 수정"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">카테고리명 *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="예: 산업, 테크, 문화"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">정렬 순서</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.sortOrder}
                    onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                  />
                  <p className={styles.hint}>숫자가 낮을수록 앞에 표시됩니다.</p>
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

export default CategoryList;
