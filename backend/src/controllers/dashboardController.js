import { supabase } from "../lib/supabase.js";

// GET /dashboard
export async function getDashboard(_req, res) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: allArticles },
    { data: publishedThisMonth },
    { data: lastIssue },
    { data: mainPageData },
  ] = await Promise.all([
    supabase.from("articles").select("id, title, category, status, created_at, author:users(name)"),
    supabase.from("articles").select("id").eq("status", "published").gte("published_at", monthStart),
    supabase.from("webzine_history").select("issue").order("issue", { ascending: false }).limit(1),
    supabase.from("main_page_config").select("sections").order("updated_at", { ascending: false }).limit(1),
  ]);

  const articles      = allArticles      || [];
  const thisMonthCount = (publishedThisMonth || []).length;
  const currentIssue  = lastIssue?.length ? lastIssue[0].issue + 1 : 1;

  const stats = [
    { label: "전체 기사",    value: String(articles.length),                                         delta: "",       color: "primary" },
    { label: "이번 달 발행", value: String(thisMonthCount),                                          delta: null,     color: "success" },
    { label: "임시저장",     value: String(articles.filter((a) => a.status === "draft").length),     delta: null,     color: "warning" },
    { label: "현재 호수",    value: `${currentIssue}호`,                                             delta: "준비 중", color: "info"    },
  ];

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
    .map(({ id, title, category, author, status, created_at }) => ({
      id, title, category,
      author: author?.name || "",
      status,
      date: new Date(created_at).toLocaleDateString("ko-KR"),
    }));

  const defaultSections = [
    { id: "headline",    label: "헤드라인",  maxSlots: 1, articles: [] },
    { id: "featured",    label: "특집 기사", maxSlots: 3, articles: [] },
    { id: "recommended", label: "추천 기사", maxSlots: 6, articles: [] },
  ];

  const sections = (mainPageData?.[0]?.sections || defaultSections).map(
    ({ id, label, maxSlots, articles: placed }) => ({
      id, label, placed: (placed || []).length, maxSlots,
    })
  );

  return res.json({ stats, recentArticles, issueStatus: { currentIssue, sections } });
}
