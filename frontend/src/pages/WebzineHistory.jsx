import ContentHeader from "@/components/layout/ContentHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import useFetch from "@/hooks/useFetch";
import * as webzineService from "@/services/webzineService";
import styles from "./WebzineHistory.module.css";

// ============================================
// WebzineHistory - 발송 이력 페이지
//
// 월 단위로 발송된 웹진의 HTML 파일을 회차별로 보관·관리합니다.
// 발송 시 생성된 HTML 파일 자체를 서버에 저장하고,
// 이 페이지에서 열람 및 다운로드할 수 있습니다.
//
// 데이터 흐름:
//   useFetch → webzineService.getHistory → axios → GET /webzine/history
//   응답: { data: [...], total: N }
//   htmlUrl: 서버에 저장된 HTML 파일 경로 (null이면 파일 없음)
// ============================================

function WebzineHistory() {
	const { data, loading, error } = useFetch(() => webzineService.getHistory(), []);

	const history = data?.data ?? [];

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "메인 페이지 구성", "발송 이력"]}
				title="발송 이력"
				subTitle="발송된 웹진의 HTML 파일을 회차별로 보관합니다."
			/>

			<div className={styles.body}>
				<div className="card">
					<div className="card-header">
						<h3>발송 이력</h3>
					</div>

					<div className="card-body">
						{loading && <LoadingSpinner />}

						{!loading && error && (
							<EmptyState icon="⚠" message={`데이터를 불러오지 못했습니다: ${error}`} />
						)}

						{!loading && !error && history.length === 0 && (
							<EmptyState message="발송된 웹진이 없습니다." />
						)}

						{!loading && !error && history.length > 0 && (
							<table className="table">
								<thead>
									<tr>
										<th>회차</th>
										<th>발송 연월</th>
										<th>발송 일시</th>
										<th>포함 기사</th>
										<th>상태</th>
										<th>HTML 파일</th>
									</tr>
								</thead>
								<tbody>
									{history.map((item) => (
										<tr key={item.id}>
											<td><strong>Vol.{item.issue}</strong></td>
											<td>{item.yearMonth}</td>
											<td className="text-muted">{item.sentAt}</td>
											<td>{item.articleCount}건</td>
											<td>
												<span className="badge badge-success">발송 완료</span>
											</td>
											<td>
												{item.htmlUrl ? (
													<div className={styles.rowActions}>
														<a
															href={item.htmlUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="btn btn-sm btn-secondary btn-external"
														>
															열기
														</a>
														<a
															href={item.htmlUrl}
															download
															className="btn btn-sm btn-secondary btn-download"
														>
															다운로드
														</a>
													</div>
												) : (
													<span className="text-muted">파일 없음</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>

					<div className="card-footer">
						<span className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>
							발송 시 생성된 HTML 파일이 서버에 저장되면 열기·다운로드가 활성화됩니다.
						</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default WebzineHistory;
