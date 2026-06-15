import { useState, useEffect } from "react";
import MainPagePreview from "./MainPagePreview";
import * as mainPageService from "@/services/mainPageService";
import styles from "./WebzinePreviewPage.module.css";

// 사이드바 없는 독립 미리보기 페이지
// 기사 카드 클릭 시 → /articles/preview/:id 새 탭

function WebzinePreviewPage() {
	const [sections, setSections] = useState(null);
	const [loading, setLoading]   = useState(true);

	useEffect(() => {
		mainPageService.getMainPage()
			.then((data) => setSections(data.sections))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <div className={styles.loading}>불러오는 중...</div>;

	return (
		<div className={styles.wrap}>
			<div className={styles.topBar}>
				<span className={styles.label}>웹진 미리보기</span>
				<button className={styles.closeBtn} onClick={() => window.close()}>✕ 닫기</button>
			</div>
			<div className={styles.previewWrap}>
				<MainPagePreview sections={sections} clickable={true} />
			</div>
		</div>
	);
}

export default WebzinePreviewPage;
