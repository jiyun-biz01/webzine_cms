import { useNavigate, useParams } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import useFetch from "@/hooks/useFetch";
import * as articleService from "@/services/articleService";
import styles from "./ArticleView.module.css";

// ============================================
// ArticleView - 기사 상세 조회 페이지
//
// /articles/:id → 기사 내용 읽기 전용 뷰
// ============================================

function ArticleView() {
	const { id } = useParams();
	const navigate = useNavigate();

	const { data: article, loading, error } = useFetch(
		() => articleService.getArticle(id),
		[id],
	);

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "기사 관리", "기사 보기"]}
				title={article?.title ?? "기사 보기"}
				actions={[
					{
						label: "편집",
						icon: "✎",
						variant: "btn-secondary",
						onClick: () => navigate(`/articles/edit/${id}`),
					},
					{
						label: "목록으로",
						variant: "btn-secondary",
						onClick: () => navigate(-1),
					},
				]}
			/>

			<div className={styles.body}>
				{loading && <LoadingSpinner />}

				{!loading && error && (
					<EmptyState icon="⚠" message={`기사를 불러오지 못했습니다: ${error}`} />
				)}

				{!loading && !error && article && (
					<div className="card">
						{/* 메타 정보 헤더 */}
						<div className={styles.meta}>
							<span className="badge badge-info">{article.category}</span>
							<StatusBadge status={article.status} />
							<span className={styles.metaText}>{article.author}</span>
							<span className={styles.metaText}>{article.date}</span>
						</div>

						{/* 제목 */}
						<h2 className={styles.title}>{article.title}</h2>

						<hr className={styles.divider} />

						{/* 본문 */}
						<div className={styles.content}>
							{article.content}
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export default ArticleView;
