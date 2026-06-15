import styles from "./MainPagePreview.module.css";

// ============================================
// MainPagePreview - 웹진 메인 페이지 미리보기
//
// sections 데이터를 받아서 실제 웹진 메인처럼 렌더링합니다.
// 편집 중인 구성을 저장 전에 확인할 수 있습니다.
//
// Props:
//   sections - MainPageConfig의 sections 상태
// ============================================

function MainPagePreview({ sections, clickable = false }) {
	if (!sections) return null;

	const headline    = sections.find((s) => s.id === "headline");
	const featured    = sections.find((s) => s.id === "featured");
	const recommended = sections.find((s) => s.id === "recommended");

	const headlineArticle     = headline?.articles[0]  ?? null;
	const featuredArticles    = featured?.articles     ?? [];
	const recommendedArticles = recommended?.articles  ?? [];

	const openArticle = (id) => {
		if (clickable && id) window.open(`/articles/preview/${id}`, "_blank");
	};

	return (
		<div className={styles.preview}>

			{/* ── 헤더 (웹진 브랜드) ── */}
			<div className={styles.siteHeader}>
				<span className={styles.siteName}>WEBZINE</span>
				<span className={styles.siteDate}>
					{new Date().toLocaleDateString("ko-KR", {
						year: "numeric", month: "long", day: "numeric",
					})}
				</span>
			</div>

			{/* ── 헤드라인 ── */}
			<section className={styles.section}>
				<h2 className={styles.sectionLabel}>헤드라인</h2>
				{headlineArticle ? (
					<div
						className={styles.heroCard}
						onClick={() => openArticle(headlineArticle.id)}
						style={{
							...(clickable ? { cursor: "pointer" } : {}),
							...(headlineArticle.thumbnail ? {
								backgroundImage: `url(${headlineArticle.thumbnail})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							} : {}),
						}}
					>
						<div className={styles.heroInner}>
							<span className={`badge badge-primary ${styles.heroBadge}`}>
								{headlineArticle.category}
							</span>
							<h3 className={styles.heroTitle}>{headlineArticle.title}</h3>
							<p className={styles.heroMeta}>
								{headlineArticle.author} · {headlineArticle.date}
							</p>
						</div>
					</div>
				) : (
					<EmptySlot label="헤드라인 기사가 선택되지 않았습니다." large />
				)}
			</section>

			{/* ── 특집 기사 ── */}
			<section className={styles.section}>
				<h2 className={styles.sectionLabel}>특집 기사</h2>
				<div className={styles.featuredGrid}>
					{Array.from({ length: featured?.maxSlots ?? 3 }).map((_, i) => {
						const article = featuredArticles[i];
						return article ? (
							<div
								key={i}
								className={styles.featuredCard}
								onClick={() => openArticle(article.id)}
								style={clickable ? { cursor: "pointer" } : {}}
							>
								{article.thumbnail
									? <img src={article.thumbnail} alt={article.title} className={styles.cardThumb} />
									: <div className={styles.cardColorBar} />
								}
								<div className={styles.cardBody}>
									<span className="badge badge-info">{article.category}</span>
									<h4 className={styles.cardTitle}>{article.title}</h4>
									<p className={styles.cardMeta}>
										{article.author} · {article.date}
									</p>
								</div>
							</div>
						) : (
							<EmptySlot key={i} />
						);
					})}
				</div>
			</section>

			{/* ── 추천 기사 ── */}
			<section className={styles.section}>
				<h2 className={styles.sectionLabel}>추천 기사</h2>
				<div className={styles.recommendedGrid}>
					{Array.from({ length: recommended?.maxSlots ?? 6 }).map((_, i) => {
						const article = recommendedArticles[i];
						return article ? (
							<div
								key={i}
								className={styles.recommendedCard}
								onClick={() => openArticle(article.id)}
								style={clickable ? { cursor: "pointer" } : {}}
							>
								<span className="badge badge-info">{article.category}</span>
								<h4 className={styles.recommendedTitle}>{article.title}</h4>
								<p className={styles.cardMeta}>
									{article.author} · {article.date}
								</p>
							</div>
						) : (
							<EmptySlot key={i} />
						);
					})}
				</div>
			</section>

		</div>
	);
}

// 기사가 없는 슬롯 표시용 내부 컴포넌트
function EmptySlot({ label = "기사 미선택", large = false }) {
	return (
		<div
			style={{
				border: "2px dashed var(--border-color)",
				borderRadius: "var(--border-radius-lg)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "var(--text-tertiary)",
				fontSize: "var(--fs-xs)",
				height: large ? "240px" : "100%",
				minHeight: large ? undefined : "120px",
			}}
		>
			{label}
		</div>
	);
}

export default MainPagePreview;
