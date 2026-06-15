import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import SubscriberSummaryCards from "@/components/common/SubscriberSummaryCards";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import useFetch from "@/hooks/useFetch";
import * as subscriberService from "@/services/subscriberService";
import styles from "./SubscriberList.module.css";

const ITEMS_PER_PAGE = 10;

function SubscriberList() {
	const navigate = useNavigate();

	const [search, setSearch]           = useState("");
	const [statusFilter, setStatus]     = useState("");
	const [currentPage, setPage]        = useState(1);
	const [selected, setSelected]       = useState([]);
	const [bulkLoading, setBulkLoading] = useState(false);

	// 등록 모달 상태
	const [modalOpen, setModalOpen]     = useState(false);
	const [addForm, setAddForm]         = useState({ email: "", name: "", ageGroup: "", region: "" });
	const [addError, setAddError]       = useState(null);
	const [adding, setAdding]           = useState(false);


	// ── 데이터 fetch ──────────────────────────────────────
	const fetcher = useCallback(
		() => subscriberService.getSubscribers({
			page: currentPage,
			limit: ITEMS_PER_PAGE,
			search,
			status: statusFilter,
		}),
		[currentPage, search, statusFilter],
	);

	const { data, loading, error, refetch } = useFetch(fetcher, [currentPage, search, statusFilter]);

	const subscribers = data?.data  ?? [];
	const total        = data?.total ?? 0;
	const stats        = data?.stats ?? { total: 0, active: 0, inactive: 0 };

	// ── 검색 / 필터 ─────────────────────────────────────
	const handleSearch = (value) => { setSearch(value); setPage(1); setSelected([]); };
	const handleStatusFilter = (e) => { setStatus(e.target.value); setPage(1); setSelected([]); };

	// ── 체크박스 ─────────────────────────────────────────
	const allChecked = subscribers.length > 0 && selected.length === subscribers.length;
	const toggleAll  = () => setSelected(allChecked ? [] : subscribers.map((s) => s.id));
	const toggleOne  = (id) => setSelected((prev) =>
		prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
	);

	// ── 일괄 처리 ────────────────────────────────────────
	const handleBulk = async (action) => {
		if (selected.length === 0) return;
		const label = action === "deactivate" ? "비활성화" : "활성화";
		if (!window.confirm(`선택한 ${selected.length}건을 ${label} 하시겠습니까?`)) return;

		setBulkLoading(true);
		try {
			if (action === "deactivate") await subscriberService.bulkDeactivate(selected);
			else                          await subscriberService.bulkActivate(selected);
			setSelected([]);
			refetch();
		} catch {
			alert("처리에 실패했습니다.");
		} finally {
			setBulkLoading(false);
		}
	};

	// ── 구독자 등록 ──────────────────────────────────────
	const openModal  = () => { setAddForm({ email: "", name: "", ageGroup: "", region: "" }); setAddError(null); setModalOpen(true); };
	const closeModal = () => { setModalOpen(false); };
	const setField   = (key) => (e) => setAddForm((p) => ({ ...p, [key]: e.target.value }));

	const handleAdd = async (e) => {
		e.preventDefault();
		if (!addForm.email.trim()) { setAddError("이메일을 입력해주세요."); return; }

		setAdding(true);
		setAddError(null);
		try {
			await subscriberService.createSubscriber(addForm);
			closeModal();
			refetch();
		} catch (err) {
			setAddError(err?.response?.data?.message || "등록에 실패했습니다.");
		} finally {
			setAdding(false);
		}
	};

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "구독자 관리", "구독자 목록"]}
				title="구독자 목록"
				subTitle="웹진 이메일 구독자를 조회하고 관리합니다."
				badge={{ text: `총 ${stats.total}명`, type: "primary" }}
				actions={[
					{
						label: "구독자 등록",
						icon: "＋",
						variant: "btn-primary",
						onClick: openModal,
					},
				]}
			/>

			<div className={styles.body}>
				<SubscriberSummaryCards stats={stats} />

				{/* 테이블 카드 */}
				<div className="card">
					<div className="card-header">
						<h3>구독자 목록</h3>
						<div className={styles.toolbar}>
							<select
								className={styles.filterSelect}
								value={statusFilter}
								onChange={handleStatusFilter}
							>
								<option value="">전체</option>
								<option value="active">활성</option>
								<option value="inactive">비활성</option>
								<option value="cancelled">구독 취소</option>
							</select>
							<SearchBar
								value={search}
								onChange={handleSearch}
								placeholder="이메일 검색..."
							/>
						</div>
					</div>

					{selected.length > 0 && (
						<div className={styles.bulkBar}>
							<span className={styles.bulkCount}>{selected.length}건 선택됨</span>
							<button className="btn btn-sm btn-secondary" onClick={() => handleBulk("activate")}  disabled={bulkLoading}>활성화</button>
							<button className="btn btn-sm btn-danger"    onClick={() => handleBulk("deactivate")} disabled={bulkLoading}>비활성화</button>
						</div>
					)}

					<div className="card-body">
						{loading && <LoadingSpinner />}
						{!loading && error && <EmptyState icon="⚠" message={`데이터를 불러오지 못했습니다: ${error}`} />}
						{!loading && !error && subscribers.length === 0 && <EmptyState message="검색 결과가 없습니다." />}

						{!loading && !error && subscribers.length > 0 && (
							<table className="table tableCenter">
								<thead>
									<tr>
										<th className={styles.colCheck}>
											<input type="checkbox" checked={allChecked} onChange={toggleAll} />
										</th>
										<th>이메일</th>
										<th className={styles.colStatus}>상태</th>
										<th className={styles.colDate}>구독 신청일</th>
										<th className={styles.colDate}>구독 취소일</th>
										<th className={styles.colActions}>관리</th>
									</tr>
								</thead>
								<tbody>
									{subscribers.map((sub) => (
										<tr key={sub.id} className={selected.includes(sub.id) ? styles.selectedRow : ""}>
											<td className={styles.colCheck}>
												<input type="checkbox" checked={selected.includes(sub.id)} onChange={() => toggleOne(sub.id)} />
											</td>
											<td className={styles.emailCell}>{sub.email}</td>
											<td>
												<span className={`badge ${sub.status === "active" ? "badge-success" : sub.status === "cancelled" ? "badge-danger" : "badge-warning"}`}>
													{sub.status === "active" ? "활성" : sub.status === "cancelled" ? "구독 취소" : "비활성"}
												</span>
											</td>
											<td className="text-muted">{sub.subscribed_at   ? new Date(sub.subscribed_at).toLocaleDateString("ko-KR")   : "-"}</td>
											<td className="text-muted">{sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString("ko-KR") : "-"}</td>
											<td>
												<button className="btn btn-sm btn-secondary" onClick={() => navigate(`/subscribers/${sub.id}`)}>
													상세
												</button>
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
								onChange={(p) => { setPage(p); setSelected([]); }}
							/>
						</div>
					)}
				</div>
			</div>

			{/* 구독자 등록 모달 */}
			{modalOpen && (
				<div className={styles.overlay} onClick={closeModal}>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<h3 className={styles.modalTitle}>구독자 등록</h3>
						<form onSubmit={handleAdd}>
							<div className="form-group">
								<label className="form-label">이메일 *</label>
								<input
									type="email"
									className="form-input"
									value={addForm.email}
									onChange={setField("email")}
									placeholder="example@email.com"
									autoFocus
								/>
							</div>
							<div className="form-group">
								<label className="form-label">이름 <span className={styles.optional}>(선택)</span></label>
								<input
									type="text"
									className="form-input"
									value={addForm.name}
									onChange={setField("name")}
									placeholder="홍길동"
								/>
							</div>
							<div className="form-group">
								<label className="form-label">연령층 <span className={styles.optional}>(선택)</span></label>
								<select className="form-select" value={addForm.ageGroup} onChange={setField("ageGroup")}>
									<option value="">선택 안 함</option>
									<option value="10대">10대</option>
									<option value="20대">20대</option>
									<option value="30대">30대</option>
									<option value="40대">40대</option>
									<option value="50대">50대</option>
									<option value="60대 이상">60대 이상</option>
								</select>
							</div>
							<div className="form-group">
								<label className="form-label">지역 <span className={styles.optional}>(선택)</span></label>
								<select className="form-select" value={addForm.region} onChange={setField("region")}>
									<option value="">선택 안 함</option>
									<option value="서울">서울</option>
									<option value="경기">경기</option>
									<option value="인천">인천</option>
									<option value="강원">강원</option>
									<option value="충북">충북</option>
									<option value="충남">충남</option>
									<option value="대전">대전</option>
									<option value="세종">세종</option>
									<option value="전북">전북</option>
									<option value="전남">전남</option>
									<option value="광주">광주</option>
									<option value="경북">경북</option>
									<option value="경남">경남</option>
									<option value="대구">대구</option>
									<option value="울산">울산</option>
									<option value="부산">부산</option>
									<option value="제주">제주</option>
									<option value="해외">해외</option>
								</select>
							</div>
							{addError && <p className={styles.formError}>{addError}</p>}
							<div className={styles.modalActions}>
								<button type="button" className="btn btn-secondary" onClick={closeModal} disabled={adding}>취소</button>
								<button type="submit"  className="btn btn-primary"   disabled={adding}>
									{adding ? "등록 중..." : "등록"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

export default SubscriberList;
