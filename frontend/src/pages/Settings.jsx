import { useState, useEffect } from "react";
import ContentHeader from "@/components/layout/ContentHeader";
import * as settingsService from "@/services/settingsService";
import styles from "./Settings.module.css";

const PUBLISH_CYCLE_OPTIONS = [
	{ value: "weekly",    label: "주간" },
	{ value: "biweekly",  label: "격주" },
	{ value: "monthly",   label: "월간" },
];

const TABS = ["일반", "이메일", "계정"];

function Settings() {
	const [activeTab, setActiveTab] = useState("일반");

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "설정"]}
				title="설정"
				subTitle="웹진 운영에 필요한 기본 설정을 관리합니다."
			/>

			<div className={styles.body}>
				<div className={styles.tabs}>
					{TABS.map((tab) => (
						<button
							key={tab}
							className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
							onClick={() => setActiveTab(tab)}
						>
							{tab} 설정
						</button>
					))}
				</div>

				<div className={styles.content}>
					{activeTab === "일반"  && <GeneralSettings />}
					{activeTab === "이메일" && <EmailSettings />}
					{activeTab === "계정"  && <AccountSettings />}
				</div>
			</div>
		</>
	);
}

// ── 일반 설정 ────────────────────────────────────────────────
function GeneralSettings() {
	const [form, setForm]       = useState({ siteName: "", siteDesc: "", publishCycle: "monthly", logoUrl: "" });
	const [loading, setLoading] = useState(true);
	const [saving, setSaving]   = useState(false);
	const [saved, setSaved]     = useState(false);
	const [error, setError]     = useState(null);

	useEffect(() => {
		settingsService.getSettings()
			.then((data) => setForm((p) => ({ ...p, ...data })))
			.catch(() => setError("설정을 불러오지 못했습니다."))
			.finally(() => setLoading(false));
	}, []);

	const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true); setError(null); setSaved(false);
		try {
			await settingsService.updateSettings(form);
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch {
			setError("저장에 실패했습니다.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p className={styles.loading}>불러오는 중...</p>;

	return (
		<form onSubmit={handleSubmit} className={styles.section}>
			<h3 className={styles.sectionTitle}>일반 설정</h3>

			<div className="form-group">
				<label className="form-label">웹진 이름 *</label>
				<input className="form-input" value={form.siteName} onChange={set("siteName")} placeholder="예: 97 웹진" />
			</div>

			<div className="form-group">
				<label className="form-label">웹진 설명</label>
				<textarea className="form-input" rows={3} value={form.siteDesc} onChange={set("siteDesc")} placeholder="웹진에 대한 간단한 소개를 입력하세요." />
			</div>

			<div className="form-group">
				<label className="form-label">발행 주기</label>
				<select className="form-select" value={form.publishCycle} onChange={set("publishCycle")}>
					{PUBLISH_CYCLE_OPTIONS.map((o) => (
						<option key={o.value} value={o.value}>{o.label}</option>
					))}
				</select>
			</div>

			<div className="form-group">
				<label className="form-label">로고 URL</label>
				<input className="form-input" value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://..." />
				{form.logoUrl && (
					<div className={styles.logoPreview}>
						<img src={form.logoUrl} alt="로고 미리보기" onError={(e) => e.target.style.display = "none"} />
					</div>
				)}
			</div>

			<SaveBar saving={saving} saved={saved} error={error} />
		</form>
	);
}

// ── 이메일 설정 ──────────────────────────────────────────────
function EmailSettings() {
	const [form, setForm]       = useState({ senderName: "", senderEmail: "", subscribeMessage: "" });
	const [loading, setLoading] = useState(true);
	const [saving, setSaving]   = useState(false);
	const [saved, setSaved]     = useState(false);
	const [error, setError]     = useState(null);

	useEffect(() => {
		settingsService.getSettings()
			.then((data) => setForm((p) => ({ ...p, ...data })))
			.catch(() => setError("설정을 불러오지 못했습니다."))
			.finally(() => setLoading(false));
	}, []);

	const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true); setError(null); setSaved(false);
		try {
			await settingsService.updateSettings(form);
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch {
			setError("저장에 실패했습니다.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p className={styles.loading}>불러오는 중...</p>;

	return (
		<form onSubmit={handleSubmit} className={styles.section}>
			<h3 className={styles.sectionTitle}>이메일 설정</h3>

			<div className="form-group">
				<label className="form-label">발신자 이름</label>
				<input className="form-input" value={form.senderName} onChange={set("senderName")} placeholder="예: 97 웹진" />
			</div>

			<div className="form-group">
				<label className="form-label">발신자 이메일</label>
				<input type="email" className="form-input" value={form.senderEmail} onChange={set("senderEmail")} placeholder="no-reply@example.com" />
			</div>

			<div className="form-group">
				<label className="form-label">구독 확인 메일 문구</label>
				<textarea
					className="form-input"
					rows={5}
					value={form.subscribeMessage}
					onChange={set("subscribeMessage")}
					placeholder={`안녕하세요!\n웹진 구독을 신청해 주셔서 감사합니다.\n매주 새로운 소식으로 찾아뵙겠습니다.`}
				/>
				<p className={styles.hint}>구독자에게 발송되는 확인 이메일 본문입니다.</p>
			</div>

			<SaveBar saving={saving} saved={saved} error={error} />
		</form>
	);
}

// ── 계정 설정 ────────────────────────────────────────────────
function AccountSettings() {
	const [form, setForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
	const [saving, setSaving] = useState(false);
	const [saved, setSaved]   = useState(false);
	const [error, setError]   = useState(null);

	const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (form.newPassword !== form.confirmPassword) {
			setError("새 비밀번호가 일치하지 않습니다."); return;
		}
		if (form.newPassword.length < 6) {
			setError("새 비밀번호는 6자 이상이어야 합니다."); return;
		}

		setSaving(true); setError(null); setSaved(false);
		try {
			await settingsService.changePassword({
				currentPassword: form.currentPassword,
				newPassword: form.newPassword,
			});
			setSaved(true);
			setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
			setTimeout(() => setSaved(false), 3000);
		} catch (err) {
			setError(err?.response?.data?.message || "비밀번호 변경에 실패했습니다.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className={styles.section}>
			<h3 className={styles.sectionTitle}>계정 설정</h3>

			<div className="form-group">
				<label className="form-label">현재 비밀번호</label>
				<input type="password" className="form-input" value={form.currentPassword} onChange={set("currentPassword")} placeholder="현재 비밀번호 입력" />
			</div>

			<div className="form-group">
				<label className="form-label">새 비밀번호</label>
				<input type="password" className="form-input" value={form.newPassword} onChange={set("newPassword")} placeholder="6자 이상" />
			</div>

			<div className="form-group">
				<label className="form-label">새 비밀번호 확인</label>
				<input type="password" className="form-input" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="새 비밀번호 재입력" />
			</div>

			<SaveBar saving={saving} saved={saved} error={error} label="비밀번호 변경" />
		</form>
	);
}

// ── 공통 저장 버튼 바 ────────────────────────────────────────
function SaveBar({ saving, saved, error, label = "저장" }) {
	return (
		<div className={styles.saveBar}>
			{error && <span className={styles.saveError}>{error}</span>}
			{saved && <span className={styles.saveSuccess}>저장되었습니다.</span>}
			<button type="submit" className="btn btn-primary" disabled={saving}>
				{saving ? "저장 중..." : label}
			</button>
		</div>
	);
}

export default Settings;
