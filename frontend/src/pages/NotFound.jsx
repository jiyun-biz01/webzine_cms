import { useNavigate } from "react-router-dom";
import styles from "./NotFound.module.css";

// ============================================
// NotFound - 404 에러 페이지
// 존재하지 않는 URL로 접근했을 때 표시됩니다.
// ============================================

function NotFound() {
	const navigate = useNavigate();

	return (
		<div className={styles.wrapper}>
			<div className={styles.container}>
				<p className={styles.code}>404</p>
				<h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
				<p className={styles.desc}>
					요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
				</p>
				<div className={styles.actions}>
					<button className={`${styles.btnPrimary} btn-nav`} onClick={() => navigate("/dashboard")}>
						대시보드로 이동
					</button>
					<button className={`${styles.btnSecondary} btn-back`} onClick={() => navigate(-1)}>
						이전 페이지로
					</button>
				</div>
			</div>
		</div>
	);
}

export default NotFound;
