import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import useFetch from "@/hooks/useFetch";
import * as articleService from "@/services/articleService";
import styles from "./ArticleList.module.css";

// ============================================
// ArticleList - 기사 목록 페이지
//
// /articles           → 전체 기사
// /articles/published → 발행된 기사
// /articles/drafts    → 임시저장
// /articles/archived  → 보관함
//
// 데이터 흐름:
//   useFetch → articleService.getArticles → axios → 백엔드 API
//   응답: { data: 기사배열, total: 전체건수, stats: 통계 }
// ============================================

const ITEMS_PER_PAGE = 10;

// URL 경로 → { status 파라미터, 페이지 제목, 부제목 }
const PATH_CONFIG = {
	"/articles/published": {
		status: "published",
		title: "발행된 기사",
		subTitle: "발행 상태인 기사 목록입니다.",
	},
	"/articles/drafts": {
		status: "draft",
		title: "임시저장",
		subTitle: "임시저장된 기사 목록입니다.",
	},
	"/articles/archived": {
		status: "archived",
		title: "보관함",
		subTitle: "보관된 기사 목록입니다.",
	},
};

function ArticleList() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	// 현재 경로에 맞는 설정 꺼내기 (없으면 전체 목록)
	const pageConfig = PATH_CONFIG[pathname] ?? {
		status: undefined,
		title: "기사 목록",
		subTitle: "등록된 모든 기사를 조회하고 관리할 수 있습니다.",
	};

	// useFetch: search, currentPage, pathname이 바뀔 때마다 자동으로 API 재호출
	const { data, loading, error, refetch } = useFetch(
		() => articleService.getArticles({
			page: currentPage,
			limit: ITEMS_PER_PAGE,
			search,
			...(pageConfig.status && { status: pageConfig.status }),
		}),
		[currentPage, search, pathname],
	);

	// 검색어 바꾸면 1페이지로 초기화
	const handleSearch = (value) => {
		setSearch(value);
		setCurrentPage(1);
	};

	// 편집 페이지로 이동
	const handleEdit = (id) => {
		navigate(`/articles/edit/${id}`);
	};

	// 백엔드 응답 구조에 맞게 꺼냄
	// 백엔드 응답이 달라지면 여기 한 곳만 수정하면 됩니다.
	const articles = data?.data ?? [];
	const total = data?.total ?? 0;
	const stats = data?.stats ?? [
		{ label: "전체 기사", value: "-", delta: null, color: "primary" },
		{ label: "발행됨",   value: "-", delta: null, color: "success" },
		{ label: "임시저장", value: "-", delta: null, color: "warning" },
		{ label: "보관함",   value: "-", delta: null, color: "info" },
	];

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "기사 관리", pageConfig.title]}
				title={pageConfig.title}
				subTitle={pageConfig.subTitle}
				badge={{ text: `총 ${total}건`, type: "primary" }}
				actions={[
					{ label: "필터", icon: "⊟", variant: "btn-secondary" },
					{ label: "기사 작성", icon: "✦", variant: "btn-primary", onClick: () => navigate("/articles/write") },
				]}
			/>

			<div className={styles.body}>
				{/* 통계 카드 */}
				<div className={styles.statGrid}>
					{stats.map((stat) => (
						<StatCard key={stat.label} {...stat} />
					))}
				</div>

				{/* 기사 테이블 */}
				<div className="card">
					<div className="card-header">
						<h3>최근 기사</h3>
						<SearchBar
							value={search}
							onChange={handleSearch}
							placeholder="제목 또는 작성자 검색..."
						/>
					</div>

					<div className="card-body">
						{/* 로딩 중 */}
						{loading && <LoadingSpinner />}

						{/* 에러 발생 */}
						{!loading && error && (
							<EmptyState
								icon="⚠"
								message={`데이터를 불러오지 못했습니다: ${error}`}
							/>
						)}

						{/* 데이터 없음 */}
						{!loading && !error && articles.length === 0 && (
							<EmptyState message="검색 결과가 없습니다." />
						)}

						{/* 데이터 있음 */}
						{!loading && !error && articles.length > 0 && (
							<table className="table">
								<thead>
									<tr>
										<th>제목</th>
										<th>카테고리</th>
										<th>작성자</th>
										<th>상태</th>
										<th>발행일</th>
										<th>관리</th>
									</tr>
								</thead>
								<tbody>
									{articles.map((article) => (
										<tr key={article.id}>
											<td
												className={`${styles.articleTitle} ${styles.articleTitleLink}`}
												onClick={() => navigate(`/articles/${article.id}`)}
											>
												{article.title}
											</td>
											<td>
												<span className="badge badge-info">
													{article.category}
												</span>
											</td>
											<td>{article.author?.name ?? "-"}</td>
											<td>
												<StatusBadge status={article.status} />
											</td>
											<td className="text-muted">
												{article.publishedAt
													? new Date(article.publishedAt).toLocaleDateString("ko-KR")
													: new Date(article.createdAt).toLocaleDateString("ko-KR")}
											</td>
											<td>
												{article.status !== "published" && (
													<div className={styles.rowActions}>
														<button
															className="btn btn-sm btn-secondary"
															onClick={() => handleEdit(article.id)}
														>
															편집
														</button>
														<button
															className="btn btn-sm btn-danger"
															onClick={() =>
																handleDelete(article.id, refetch)
															}
														>
															삭제
														</button>
													</div>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>

					{!loading && total > 0 && (
						<div className="card-footer">
							<Pagination
								totalItems={total}
								itemsPerPage={ITEMS_PER_PAGE}
								currentPage={currentPage}
								onChange={setCurrentPage}
							/>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

// ── 삭제 처리 (컴포넌트 밖에 분리해서 JSX를 깔끔하게 유지) ──
async function handleDelete(id, refetch) {
	if (!window.confirm("정말 삭제하시겠습니까?")) return;
	try {
		await articleService.deleteArticle(id);
		refetch(); // 삭제 후 목록 새로고침
	} catch {
		alert("삭제에 실패했습니다.");
	}
}

export default ArticleList;
