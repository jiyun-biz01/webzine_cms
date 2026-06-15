import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import * as mainPageService from "@/services/mainPageService";
import * as webzineService from "@/services/webzineService";
import styles from "./WebzineSend.module.css";

function WebzineSend() {
	const navigate = useNavigate();
	const [sections, setSections] = useState(null);
	const [loading, setLoading]   = useState(true);
	const [sending, setSending]   = useState(false);
	const [error, setError]       = useState(null);

	const now = new Date();
	const [yearMonth, setYearMonth] = useState(
		`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
	);

	useEffect(() => {
		mainPageService.getMainPage()
			.then((data) => setSections(data.sections))
			.catch(() => setError("메인 페이지 구성을 불러오지 못했습니다."))
			.finally(() => setLoading(false));
	}, []);

	const articleCount = sections
		? sections.reduce((sum, s) => sum + (s.articles?.filter(Boolean).length ?? 0), 0)
		: 0;

	const openPreview = () => {
		window.open("/webzine/preview", "_blank");
	};

	const handleSend = async () => {
		if (!window.confirm(`${yearMonth} 웹진을 발송하시겠습니까?`)) return;
		setSending(true);
		setError(null);
		try {
			await webzineService.sendWebzine({ yearMonth, articleCount });
			navigate("/main-page/history");
		} catch (err) {
			setError(err?.response?.data?.message || "발송에 실패했습니다.");
			setSending(false);
		}
	};

	if (loading) return <LoadingSpinner />;

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "메인 페이지 구성", "웹진 발송"]}
				title="웹진 발송"
				subTitle="발송 전 미리보기를 확인하고 발송합니다."
				actions={[
					{
						label: "목록으로",
						variant: "btn-secondary",
						onClick: () => navigate("/main-page"),
					},
				]}
			/>

			<div className={styles.body}>
				{/* 발송 정보 카드 */}
				<div className="card">
					<div className="card-header">
						<h3>발송 정보</h3>
					</div>
					<div className="card-body">
						<div className={styles.infoGrid}>
							<div className={styles.infoItem}>
								<span className={styles.infoLabel}>포함 기사 수</span>
								<span className={styles.infoValue}>{articleCount}건</span>
							</div>

							<div className={styles.infoItem}>
								<span className={styles.infoLabel}>발행 연월</span>
								<input
									type="month"
									className={`form-input ${styles.monthInput}`}
									value={yearMonth}
									onChange={(e) => setYearMonth(e.target.value)}
								/>
							</div>
						</div>

						{/* 섹션 요약 */}
						<div className={styles.sectionSummary}>
							{sections?.map((section) => {
								const count = section.articles?.filter(Boolean).length ?? 0;
								return (
									<div key={section.id} className={styles.sectionItem}>
										<span className={styles.sectionName}>{section.label ?? section.id}</span>
										<span className={`badge ${count > 0 ? "badge-success" : "badge-warning"}`}>
											{count > 0 ? `${count}건` : "미설정"}
										</span>
									</div>
								);
							})}
						</div>
					</div>
					<div className="card-footer">
						<button className="btn btn-secondary" onClick={openPreview}>
							🔍 미리보기 (새 탭)
						</button>
						<button
							className="btn btn-primary"
							onClick={handleSend}
							disabled={sending || articleCount === 0}
						>
							{sending ? "발송 중..." : "✉ 발송하기"}
						</button>
					</div>
					{error && <p className={styles.error}>{error}</p>}
					{articleCount === 0 && (
						<p className={styles.warn}>메인 페이지에 기사를 먼저 배치해주세요.</p>
					)}
				</div>
			</div>
		</>
	);
}

export default WebzineSend;
