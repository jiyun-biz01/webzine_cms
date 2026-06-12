import articles from "../data/articles.js";
import mainPage from "../data/mainPage.js";
import webzineHistory from "../data/webzineHistory.js";

// ============================================
// dashboardController - 대시보드 통계 API
//
// GET /dashboard
// 응답: { stats, recentArticles, issueStatus }
// ============================================

export function getDashboard(_req, res) {
  const now = new Date();
  const thisMonthPrefix = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  const publishedThisMonth = articles.filter(
    (a) => a.status === "published" && a.date.startsWith(thisMonthPrefix),
  ).length;

  // 다음 호수 = 마지막 발행 호수 + 1
  const currentIssue =
    webzineHistory.length > 0
      ? Math.max(...webzineHistory.map((h) => h.issue)) + 1
      : 1;

  // ── 통계 카드 4개 ─────────────────────────────
  const stats = [
    {
      label: "전체 기사",
      value: String(articles.length),
      delta: "+2 이번 주",
      color: "primary",
    },
    {
      label: "이번 달 발행",
      value: String(publishedThisMonth),
      delta: null,
      color: "success",
    },
    {
      label: "임시저장",
      value: String(articles.filter((a) => a.status === "draft").length),
      delta: null,
      color: "warning",
    },
    {
      label: "현재 호수",
      value: `${currentIssue}호`,
      delta: "준비 중",
      color: "info",
    },
  ];

  // ── 최근 기사 5개 (날짜 내림차순) ──────────────
  const recentArticles = [...articles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(({ id, title, category, author, status, date }) => ({
      id,
      title,
      category,
      author,
      status,
      date,
    }));

  // ── 현재 호 구성 현황 ─────────────────────────
  const sections = mainPage.sections.map(({ id, label, maxSlots, articles: placed }) => ({
    id,
    label,
    placed: placed.length,
    maxSlots,
  }));

  const issueStatus = { currentIssue, sections };

  return res.json({ stats, recentArticles, issueStatus });
}
