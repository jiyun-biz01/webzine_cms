import { useState, useEffect } from "react";
import useFetch from "@/hooks/useFetch";
import * as articleService from "@/services/articleService";
import styles from "./ArticlePickerModal.module.css";

// ============================================
// ArticlePickerModal - 기사 선택 모달
//
// Props:
//   isOpen     - 모달 표시 여부
//   onClose    - 닫기 버튼 / 배경 클릭 시 호출
//   onSelect   - 기사 선택 시 호출: (article) => void
//   excludeIds - 이미 배치된 기사 id 배열 (중복 선택 방지)
// ============================================

function ArticlePickerModal({ isOpen, onClose, onSelect, excludeIds = [] }) {
  const [search, setSearch] = useState("");

  // 모달 닫힐 때 검색어 초기화 (다음에 열면 빈 상태로 시작)
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const { data, loading } = useFetch(
    () => articleService.getArticles({ status: "published", limit: 50 }),
    [],
  );

  if (!isOpen) return null;

  const articles = data?.data ?? [];
  const filtered = articles.filter(
    (a) =>
      !excludeIds.includes(a.id) &&
      (a.title.includes(search) || (a.author?.name ?? "").includes(search)),
  );

  const handleSelect = (article) => {
    onSelect(article);
    onClose();
  };

  return (
    // 배경(backdrop) 클릭 시 닫힘
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 카드 클릭이 backdrop 클릭으로 전파되지 않도록 */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <h3>기사 선택</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.search}>
          <input
            className="form-input"
            type="text"
            placeholder="제목 또는 작성자 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <ul className={styles.list}>
          {loading && <li className={styles.empty}>불러오는 중...</li>}
          {!loading && filtered.length === 0 && (
            <li className={styles.empty}>선택 가능한 기사가 없습니다.</li>
          )}
          {filtered.map((article) => (
            <li key={article.id}>
              <button
                className={styles.item}
                onClick={() => handleSelect(article)}
              >
                <div className={styles.itemMeta}>
                  <span className="badge badge-info">{article.category}</span>
                  <span className={styles.itemDate}>{article.date}</span>
                </div>
                <p className={styles.itemTitle}>{article.title}</p>
                <span className={styles.itemAuthor}>{article.author?.name ?? "-"}</span>
              </button>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}

export default ArticlePickerModal;
