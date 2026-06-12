import { useNavigate } from "react-router-dom";
import ContentHeader from "@/components/layout/ContentHeader";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import useFetch from "@/hooks/useFetch";
import * as dashboardService from "@/services/dashboardService";
import styles from "./Dashboard.module.css";

// ============================================
// Dashboard - 대시보드 페이지
//
// 구성:
//   1. 통계 카드 4개 (전체 기사 / 이번 달 발행 / 임시저장 / 현재 호수)
//   2. 최근 기사 목록 (5개)
//   3. 현재 호 구성 현황 (섹션별 배치 진행도)
//   4. 빠른 바로가기
// ============================================

function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => dashboardService.getDashboard(), []);

  const stats         = data?.stats          ?? [];
  const recentArticles = data?.recentArticles ?? [];
  const issueStatus   = data?.issueStatus    ?? null;

  return (
    <>
      <ContentHeader
        breadcrumb={["홈", "대시보드"]}
        title="대시보드"
        subTitle="웹진 전체 현황을 한눈에 확인합니다."
      />

      <div className={styles.body}>

        {/* ── 1. 통계 카드 ───────────────────────── */}
        {loading && <LoadingSpinner />}
        {!loading && error && (
          <EmptyState icon="⚠" message={`데이터를 불러오지 못했습니다: ${error}`} />
        )}

        {!loading && !error && (
          <>
            <div className={styles.statGrid}>
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            {/* ── 2·3. 최근 기사 + 호 구성 현황 ──────── */}
            <div className={styles.mainGrid}>

              {/* 최근 기사 목록 - leftPanel로 감싸서 grid 셀 높이를 꽉 채움 */}
              <div className={styles.leftPanel}>
              <div className="card">
                <div className="card-header">
                  <h3>최근 기사</h3>
                  <button
                    className="btn btn-sm btn-secondary btn-nav"
                    onClick={() => navigate("/articles")}
                  >
                    전체 보기
                  </button>
                </div>
                <div className="card-body">
                  {recentArticles.length === 0 ? (
                    <EmptyState message="기사가 없습니다." />
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>제목</th>
                          <th>카테고리</th>
                          <th>상태</th>
                          <th>날짜</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentArticles.map((article) => (
                          <tr key={article.id}>
                            <td
                              className={styles.articleTitle}
                              onClick={() => navigate(`/articles/${article.id}`)}
                            >
                              {article.title}
                            </td>
                            <td>
                              <span className="badge badge-info">{article.category}</span>
                            </td>
                            <td>
                              <StatusBadge status={article.status} />
                            </td>
                            <td className="text-muted">{article.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              </div>{/* leftPanel 닫기 */}

              {/* 현재 호 구성 현황 */}
              <div className={styles.sidePanel}>
                <div className={`card ${styles.issueCard}`}>
                  <div className="card-header">
                    <h3>
                      {issueStatus
                        ? `${issueStatus.currentIssue}호 구성 현황`
                        : "호 구성 현황"}
                    </h3>
                  </div>
                  <div className="card-body">
                    {issueStatus ? (
                      <div className={styles.sectionList}>
                        {issueStatus.sections.map((section) => {
                          const pct = Math.round((section.placed / section.maxSlots) * 100);
                          const isFull = section.placed >= section.maxSlots;
                          return (
                            <div key={section.id} className={styles.sectionItem}>
                              <div className={styles.sectionTop}>
                                <span className={styles.sectionLabel}>{section.label}</span>
                                <span className={`${styles.sectionCount} ${isFull ? styles.full : ""}`}>
                                  {section.placed} / {section.maxSlots}
                                </span>
                              </div>
                              <div className={styles.progressBar}>
                                <div
                                  className={`${styles.progressFill} ${isFull ? styles.progressFull : ""}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState message="구성 현황을 불러오지 못했습니다." />
                    )}
                  </div>
                  <div className="card-footer">
                    <button
                      className="btn btn-sm btn-primary btn-nav"
                      onClick={() => navigate("/main-page")}
                    >
                      메인 페이지 편집
                    </button>
                  </div>
                </div>

                {/* ── 4. 빠른 바로가기 ───────────────── */}
                <div className="card">
                  <div className="card-header">
                    <h3>빠른 바로가기</h3>
                  </div>
                  <div className="card-body">
                    <div className={styles.shortcuts}>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/articles/write")}
                      >
                        ✦ 새 기사 작성
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/articles/drafts")}
                      >
                        임시저장 보기
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/main-page/history")}
                      >
                        웹진 히스토리
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
