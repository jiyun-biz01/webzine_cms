import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import useFetch from "@/hooks/useFetch";
import * as subscriberService from "@/services/subscriberService";
import styles from "./SubscriberDetail.module.css";

// ============================================
// SubscriberDetail - 구독자 상세 / 상태 변경 페이지
//
// /subscribers/:id
//
// 기능:
//   - 이메일, 상태, 날짜 조회
//   - 활성 ↔ 비활성 토글
//   - 등록 페이지 역할 겸용: id === "new" 이면 등록 폼 표시
// ============================================

function SubscriberDetail() {
	const { id }    = useParams();
	const navigate  = useNavigate();
	const isNew     = id === "new";

	return isNew ? <RegisterForm navigate={navigate} /> : <DetailView id={id} navigate={navigate} />;
}

// ── 상세 뷰 ──────────────────────────────────────────────────
function DetailView({ id, navigate }) {
	const [toggling, setToggling]   = useState(false);
	const [cancelling, setCancelling] = useState(false);

	const { data: sub, loading, error, refetch } = useFetch(
		() => subscriberService.getSubscriber(id),
		[id],
	);

	const handleToggle = async () => {
		if (!sub) return;
		const isActive = sub.status === "active";
		const label    = isActive ? "비활성화" : "활성화";
		if (!window.confirm(`이 구독자를 ${label} 하시겠습니까?`)) return;

		setToggling(true);
		try {
			if (isActive) await subscriberService.deactivateSubscriber(id);
			else           await subscriberService.activateSubscriber(id);
			refetch();
		} catch (e) {
			alert(e.message || "처리에 실패했습니다.");
		} finally {
			setToggling(false);
		}
	};

	const handleCancel = async () => {
		if (!sub) return;
		if (!window.confirm("구독을 취소하시겠습니까?\n취소 후에는 재활성화할 수 없습니다.")) return;

		setCancelling(true);
		try {
			await subscriberService.cancelSubscriber(id);
			refetch();
		} catch (e) {
			alert(e.message || "처리에 실패했습니다.");
		} finally {
			setCancelling(false);
		}
	};

	if (loading) return <LoadingSpinner />;
	if (error)   return <EmptyState icon="⚠" message={`오류: ${error}`} />;
	if (!sub)    return null;

	const isActive    = sub.status === "active";
	const isCancelled = sub.status === "cancelled";

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "구독자 관리", "구독자 상세"]}
				title="구독자 상세"
				actions={[
					{
						label: "목록으로",
						variant: "btn-secondary",
						onClick: () => navigate("/subscribers"),
					},
				]}
			/>

			<div className={styles.body}>
				<div className="card">
					<div className="card-header">
						<h3>구독자 정보</h3>
						<span className={`badge ${isActive ? "badge-success" : isCancelled ? "badge-danger" : "badge-warning"}`}>
							{isActive ? "활성" : isCancelled ? "구독 취소" : "비활성"}
						</span>
					</div>
					<div className="card-body">
						<dl className={styles.infoGrid}>
							<dt>이메일</dt>
							<dd className={styles.email}>{sub.email}</dd>

							<dt>이름</dt>
							<dd>{sub.name ?? "-"}</dd>

							<dt>연령층</dt>
							<dd>{sub.age_group ?? "-"}</dd>

							<dt>지역</dt>
							<dd>{sub.region ?? "-"}</dd>

							<dt>상태</dt>
							<dd>
								<span className={`badge ${isActive ? "badge-success" : isCancelled ? "badge-danger" : "badge-warning"}`}>
									{isActive ? "활성" : isCancelled ? "구독 취소" : "비활성"}
								</span>
							</dd>

							<dt>구독 신청일</dt>
							<dd>{sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString("ko-KR") : "-"}</dd>

							<dt>구독 취소일</dt>
							<dd>{sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString("ko-KR") : "-"}</dd>
						</dl>
					</div>
					<div className="card-footer">
						{!isCancelled && (
							<button
								className={`btn ${isActive ? "btn-warning" : "btn-success"}`}
								onClick={handleToggle}
								disabled={toggling}
							>
								{toggling ? "처리 중..." : isActive ? "비활성화" : "활성화"}
							</button>
						)}
						{!isCancelled && (
							<button
								className="btn btn-danger"
								onClick={handleCancel}
								disabled={cancelling}
								style={{ marginLeft: "var(--spacing-sm)" }}
							>
								{cancelling ? "처리 중..." : "구독 취소"}
							</button>
						)}
						{isCancelled && (
							<span style={{ fontSize: "var(--fs-sm)", color: "var(--text-tertiary)" }}>
								구독이 취소된 회원입니다.
							</span>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

// ── 신규 등록 폼 ──────────────────────────────────────────────
function RegisterForm({ navigate }) {
	const [email, setEmail]     = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError]     = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		const trimmed = email.trim();
		if (!trimmed) {
			setError("이메일을 입력해주세요.");
			return;
		}
		if (!isValidEmail(trimmed)) {
			setError("올바른 이메일 형식이 아닙니다.");
			return;
		}

		setLoading(true);
		try {
			await subscriberService.createSubscriber(trimmed);
			navigate("/subscribers");
		} catch (e) {
			setError(e.message || "등록에 실패했습니다.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "구독자 관리", "구독자 등록"]}
				title="구독자 등록"
				subTitle="이메일 주소를 입력하여 구독자를 직접 등록합니다."
				actions={[
					{
						label: "목록으로",
						variant: "btn-secondary",
						onClick: () => navigate("/subscribers"),
					},
				]}
			/>

			<div className={styles.body}>
				<div className="card">
					<div className="card-header">
						<h3>신규 구독자 등록</h3>
					</div>
					<div className="card-body">
						<form onSubmit={handleSubmit} className={styles.registerForm}>
							<div className={styles.formGroup}>
								<label htmlFor="email" className={styles.label}>
									이메일 주소 <span className={styles.required}>*</span>
								</label>
								<input
									id="email"
									type="email"
									className={`${styles.input} ${error ? styles.inputError : ""}`}
									value={email}
									onChange={(e) => { setEmail(e.target.value); setError(""); }}
									placeholder="example@domain.com"
									autoFocus
								/>
								{error && <p className={styles.errorMsg}>{error}</p>}
								<p className={styles.hint}>
									이미 비활성화된 이메일은 재활성화 처리됩니다.
								</p>
							</div>

							<div className={styles.formActions}>
								<button
									type="button"
									className="btn btn-secondary"
									onClick={() => navigate("/subscribers")}
								>
									취소
								</button>
								<button
									type="submit"
									className="btn btn-primary"
									disabled={loading}
								>
									{loading ? "등록 중..." : "등록하기"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default SubscriberDetail;
