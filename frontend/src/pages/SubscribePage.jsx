import { useState } from "react";
import * as subscriberService from "@/services/subscriberService";
import styles from "./SubscribePage.module.css";

// ============================================
// SubscribePage - 공개 구독 신청/취소 페이지
//
// /subscribe
//
// 관리시스템(AppLayout)과 완전히 분리된 독립 페이지입니다.
// 로그인 불필요, 사이드바/탑바 없음.
//
// 기능:
//   - 구독 신청 (중복 체크, 비활성→재구독)
//   - 구독 취소
// ============================================

function SubscribePage() {
	const [tab, setTab] = useState("subscribe"); // "subscribe" | "unsubscribe"

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				{/* 헤더 */}
				<div className={styles.header}>
					<div className={styles.logo}>📰</div>
					<h1 className={styles.title}>웹진 구독 관리</h1>
					<p className={styles.subtitle}>최신 소식을 이메일로 받아보세요.</p>
				</div>

				{/* 탭 */}
				<div className={styles.tabs}>
					<button
						className={`${styles.tab} ${tab === "subscribe" ? styles.tabActive : ""}`}
						onClick={() => setTab("subscribe")}
					>
						구독 신청
					</button>
					<button
						className={`${styles.tab} ${tab === "unsubscribe" ? styles.tabActive : ""}`}
						onClick={() => setTab("unsubscribe")}
					>
						구독 취소
					</button>
				</div>

				{/* 탭 콘텐츠 */}
				<div className={styles.content}>
					{tab === "subscribe" ? <SubscribeForm /> : <UnsubscribeForm />}
				</div>

				<p className={styles.footer}>
					문의사항이 있으시면 관리자에게 연락해주세요.
				</p>
			</div>
		</div>
	);
}

// ── 구독 신청 폼 ─────────────────────────────────────────────
function SubscribeForm() {
	const [email, setEmail]     = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult]   = useState(null); // { type: 'success'|'error', message }

	const handleSubmit = async (e) => {
		e.preventDefault();
		setResult(null);

		const trimmed = email.trim();
		if (!trimmed) {
			setResult({ type: "error", message: "이메일 주소를 입력해주세요." });
			return;
		}
		if (!isValidEmail(trimmed)) {
			setResult({ type: "error", message: "올바른 이메일 형식이 아닙니다." });
			return;
		}

		setLoading(true);
		try {
			const res = await subscriberService.publicSubscribe(trimmed);
			const msg = res.reactivated
				? "재구독이 완료되었습니다. 다시 웹진을 받아보실 수 있습니다."
				: "구독 신청이 완료되었습니다. 감사합니다!";
			setResult({ type: "success", message: msg });
			setEmail("");
		} catch (e) {
			setResult({ type: "error", message: e.message || "구독 신청에 실패했습니다." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<p className={styles.description}>
				이메일 주소를 입력하시면 웹진 발송 시 이메일로 소식을 전달해드립니다.
			</p>

			<div className={styles.inputRow}>
				<input
					type="email"
					className={styles.input}
					value={email}
					onChange={(e) => { setEmail(e.target.value); setResult(null); }}
					placeholder="example@domain.com"
					disabled={loading}
					autoFocus
				/>
				<button
					type="submit"
					className={`${styles.submitBtn} ${styles.submitBtnPrimary}`}
					disabled={loading}
				>
					{loading ? "처리 중..." : "구독하기"}
				</button>
			</div>

			{result && (
				<p className={`${styles.resultMsg} ${result.type === "success" ? styles.success : styles.error}`}>
					{result.type === "success" ? "✓ " : "✕ "}
					{result.message}
				</p>
			)}
		</form>
	);
}

// ── 구독 취소 폼 ─────────────────────────────────────────────
function UnsubscribeForm() {
	const [email, setEmail]     = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult]   = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setResult(null);

		const trimmed = email.trim();
		if (!trimmed) {
			setResult({ type: "error", message: "이메일 주소를 입력해주세요." });
			return;
		}
		if (!isValidEmail(trimmed)) {
			setResult({ type: "error", message: "올바른 이메일 형식이 아닙니다." });
			return;
		}

		setLoading(true);
		try {
			await subscriberService.publicUnsubscribe(trimmed);
			setResult({ type: "success", message: "구독이 취소되었습니다. 더 이상 이메일을 받지 않으실 수 있습니다." });
			setEmail("");
		} catch (e) {
			setResult({ type: "error", message: e.message || "구독 취소에 실패했습니다." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<p className={styles.description}>
				구독을 취소하시려면 구독 시 등록하신 이메일 주소를 입력해주세요.
			</p>

			<div className={styles.inputRow}>
				<input
					type="email"
					className={styles.input}
					value={email}
					onChange={(e) => { setEmail(e.target.value); setResult(null); }}
					placeholder="example@domain.com"
					disabled={loading}
				/>
				<button
					type="submit"
					className={`${styles.submitBtn} ${styles.submitBtnDanger}`}
					disabled={loading}
				>
					{loading ? "처리 중..." : "구독 취소"}
				</button>
			</div>

			{result && (
				<p className={`${styles.resultMsg} ${result.type === "success" ? styles.success : styles.error}`}>
					{result.type === "success" ? "✓ " : "✕ "}
					{result.message}
				</p>
			)}
		</form>
	);
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default SubscribePage;
