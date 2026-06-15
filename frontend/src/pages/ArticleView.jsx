import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import useFetch from "@/hooks/useFetch";
import * as articleService from "@/services/articleService";
import * as templateService from "@/services/templateService";
import styles from "./ArticleView.module.css";

const VIEWPORTS = [
	{ key: "desktop", label: "데스크탑", width: "100%" },
	{ key: "tablet",  label: "태블릿",   width: "768px" },
	{ key: "mobile",  label: "모바일",   width: "375px" },
];

function ArticleView() {
	const { id }     = useParams();
	const navigate   = useNavigate();
	const [archiving, setArchiving] = useState(false);
	const [template, setTemplate]   = useState(null);
	const [viewport, setViewport]   = useState("desktop");

	const { data: article, loading, error, refetch } = useFetch(
		() => articleService.getArticle(id),
		[id],
	);

	useEffect(() => {
		if (!article?.templateId) { setTemplate(null); return; }
		templateService.getTemplate(article.templateId)
			.then(setTemplate)
			.catch(() => setTemplate(null));
	}, [article?.templateId]);

	const handleArchive = async () => {
		if (!window.confirm("이 기사를 보관함으로 이동하시겠습니까?")) return;
		setArchiving(true);
		try {
			await articleService.updateArticle(id, { status: "archived" });
			refetch();
		} catch {
			alert("보관 처리에 실패했습니다.");
		} finally {
			setArchiving(false);
		}
	};

	const handleUnarchive = async () => {
		if (!window.confirm("이 기사를 임시저장으로 되돌리시겠습니까?")) return;
		setArchiving(true);
		try {
			await articleService.updateArticle(id, { status: "draft" });
			refetch();
		} catch {
			alert("처리에 실패했습니다.");
		} finally {
			setArchiving(false);
		}
	};

	const archiveAction = article?.status === "archived"
		? { label: "보관 해제",  variant: "btn-secondary", onClick: handleUnarchive }
		: { label: archiving ? "처리 중..." : "보관함으로", variant: "btn-warning", onClick: handleArchive };

	const currentViewport = VIEWPORTS.find((v) => v.key === viewport);

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "기사 관리", "기사 보기"]}
				title={article?.title ?? "기사 보기"}
				actions={[
					{ label: "편집", icon: "✎", variant: "btn-secondary", onClick: () => navigate(`/articles/edit/${id}`) },
					...(article ? [archiveAction] : []),
					{ label: "목록으로", variant: "btn-secondary", onClick: () => navigate(-1) },
				]}
			/>

			<div className={styles.body}>
				{loading && <LoadingSpinner />}
				{!loading && error && <EmptyState icon="⚠" message={`기사를 불러오지 못했습니다: ${error}`} />}

				{!loading && !error && article && (
					<div className="card">
						{/* 메타 정보 */}
						<div className={styles.meta}>
							<span className="badge badge-info">{article.category}</span>
							<StatusBadge status={article.status} />
							<span className={styles.metaText}>{article.author?.name ?? "-"}</span>
							<span className={styles.metaText}>
								{article.publishedAt
									? new Date(article.publishedAt).toLocaleDateString("ko-KR")
									: new Date(article.createdAt).toLocaleDateString("ko-KR")}
							</span>

							{/* 뷰포트 토글 */}
							<div className={styles.viewportToggle}>
								{VIEWPORTS.map((v) => (
									<button
										key={v.key}
										className={`${styles.vpBtn} ${viewport === v.key ? styles.vpBtnActive : ""}`}
										onClick={() => setViewport(v.key)}
									>
										{v.label}
									</button>
								))}
							</div>
						</div>

						{/* 본문 — 뷰포트 너비 적용 */}
						<div className={styles.previewArea}>
							<div className={styles.viewport} style={{ width: currentViewport.width }}>
								<TemplateRenderer article={article} template={template} />
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export default ArticleView;
