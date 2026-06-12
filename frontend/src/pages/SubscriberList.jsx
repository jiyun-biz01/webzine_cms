import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import StatCard from "@/components/common/StatCard";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import useFetch from "@/hooks/useFetch";
import * as subscriberService from "@/services/subscriberService";
import styles from "./SubscriberList.module.css";

// ============================================
// SubscriberList - 구독자 관리 목록 페이지
//
// 기능:
//   - 이메일 검색
//   - 상태 필터 (전체 / 활성 / 비활성)
//   - 체크박스 일괄 처리 (활성화 / 비활성화)
//   - 상세 페이지로 이동
// ============================================

const ITEMS_PER_PAGE = 10;

function SubscriberList() {
	const navigate = useNavigate();

	const [search, setSearch]         = useState("");
	const [statusFilter, setStatus]   = useState("");
	const [currentPage, setPage]       = useState(1);
	const [selected, setSelected]      = useState([]); // 체크된 id 배열
	const [bulkLoading, setBulkLoading] = useState(false);

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

	// ── 검색 / 필터 변경 시 1페이지로 ───────────────────
	const handleSearch = (value) => {
		setSearch(value);
		setPage(1);
		setSelected([]);
	};

	const handleStatusFilter = (e) => {
		setStatus(e.target.value);
		setPage(1);
		setSelected([]);
	};

	// ── 체크박스 ─────────────────────────────────────────
	const allChecked = subscribers.length > 0 && selected.length === subscribers.length;

	const toggleAll = () => {
		setSelected(allChecked ? [] : subscribers.map((s) => s.id));
	};

	const toggleOne = (id) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

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
						onClick: () => navigate("/subscribers/new"),
					},
				]}
			/>

			<div className={styles.body}>
				{/* 통계 카드 */}
				<div className={styles.statGrid}>
					<StatCard label="전체 구독자" value={stats.total} color="primary" />
					<StatCard label="활성"         value={stats.active}   color="success" />
					<StatCard label="비활성"       value={stats.inactive} color="danger" />
				</div>

				{/* 테이블 카드 */}
				<div className="card">
					<div className="card-header">
						<h3>구독자 목록</h3>
						<div className={styles.toolbar}>
							{/* 상태 필터 */}
							<select
								className={styles.filterSelect}
								value={statusFilter}
								onChange={handleStatusFilter}
							>
								<option value="">전체</option>
								<option value="active">활성</option>
								<option value="inactive">비활성</option>
							</select>

							<SearchBar
								value={search}
								onChange={handleSearch}
								placeholder="이메일 검색..."
							/>
						</div>
					</div>

					{/* 일괄 처리 바 */}
					{selected.length > 0 && (
						<div className={styles.bulkBar}>
							<span className={styles.bulkCount}>{selected.length}건 선택됨</span>
							<button
								className="btn btn-sm btn-secondary"
								onClick={() => handleBulk("activate")}
								disabled={bulkLoading}
							>
								활성화
							</button>
							<button
								className="btn btn-sm btn-danger"
								onClick={() => handleBulk("deactivate")}
								disabled={bulkLoading}
							>
								비활성화
							</button>
						</div>
					)}

					<div className="card-body">
						{loading && <LoadingSpinner />}

						{!loading && error && (
							<EmptyState icon="⚠" message={`데이터를 불러오지 못했습니다: ${error}`} />
						)}

						{!loading && !error && subscribers.length === 0 && (
							<EmptyState message="검색 결과가 없습니다." />
						)}

						{!loading && !error && subscribers.length > 0 && (
							<table className="table tableCenter">
								<thead>
									<tr>
										<th className={styles.colCheck}>
											<input
												type="checkbox"
												checked={allChecked}
												onChange={toggleAll}
											/>
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
												<input
													type="checkbox"
													checked={selected.includes(sub.id)}
													onChange={() => toggleOne(sub.id)}
												/>
											</td>
											<td className={styles.emailCell}>{sub.email}</td>
											<td>
												<span className={`badge ${sub.status === "active" ? "badge-success" : "badge-danger"}`}>
													{sub.status === "active" ? "활성" : "비활성"}
												</span>
											</td>
											<td className="text-muted">{sub.subscribedAt ?? "-"}</td>
											<td className="text-muted">{sub.unsubscribedAt ?? "-"}</td>
											<td>
												<button
													className="btn btn-sm btn-secondary"
													onClick={() => navigate(`/subscribers/${sub.id}`)}
												>
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
		</>
	);
}

export default SubscriberList;
