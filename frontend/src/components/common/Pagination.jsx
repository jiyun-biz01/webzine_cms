import styles from "./Pagination.module.css";

// ============================================
// Pagination - 페이지네이션 컴포넌트
//
// Props:
//   totalItems   - 전체 아이템 수
//   itemsPerPage - 페이지당 아이템 수 (기본값: 10)
//   currentPage  - 현재 페이지 번호 (1부터 시작)
//   onChange     - 페이지 변경 시 호출되는 함수: (pageNumber) => void
//
// 사용 예:
//   <Pagination
//     totalItems={128}
//     currentPage={page}
//     onChange={(p) => setPage(p)}
//   />
// ============================================

function Pagination({ totalItems, itemsPerPage = 10, currentPage = 1, onChange }) {
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	// 표시할 페이지 번호 범위 계산 (현재 페이지 기준 앞뒤 2개)
	const getPageNumbers = () => {
		const delta = 2;
		const start = Math.max(1, currentPage - delta);
		const end = Math.min(totalPages, currentPage + delta);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	};

	if (totalPages <= 1) return null;

	const pageNumbers = getPageNumbers();
	const from = (currentPage - 1) * itemsPerPage + 1;
	const to = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<div className={styles.wrapper}>
			<span className="text-muted">
				총 {totalItems}개 중 {from}-{to} 표시
			</span>

			<div className="pagination">
				{/* 이전 페이지 */}
				<button
					className="page-btn"
					onClick={() => onChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					‹
				</button>

				{/* 첫 페이지 + 생략 */}
				{pageNumbers[0] > 1 && (
					<>
						<button className="page-btn" onClick={() => onChange(1)}>1</button>
						{pageNumbers[0] > 2 && <span className={styles.ellipsis}>…</span>}
					</>
				)}

				{/* 페이지 번호 목록 */}
				{pageNumbers.map((page) => (
					<button
						key={page}
						className={`page-btn ${page === currentPage ? "active" : ""}`}
						onClick={() => onChange(page)}
					>
						{page}
					</button>
				))}

				{/* 마지막 페이지 + 생략 */}
				{pageNumbers[pageNumbers.length - 1] < totalPages && (
					<>
						{pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
							<span className={styles.ellipsis}>…</span>
						)}
						<button className="page-btn" onClick={() => onChange(totalPages)}>
							{totalPages}
						</button>
					</>
				)}

				{/* 다음 페이지 */}
				<button
					className="page-btn"
					onClick={() => onChange(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					›
				</button>
			</div>
		</div>
	);
}

export default Pagination;
