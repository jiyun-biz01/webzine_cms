import articles from "../data/articles.js";

// ============================================
// articleController - 기사 관련 로직
//
// 실제 DB 연동 시:
//   articles 배열 → ORM(Prisma, Mongoose 등) 쿼리로 교체
//   id 자동 생성 → DB auto-increment / ObjectId로 교체
// ============================================

// ── 기사 목록 조회 ─────────────────────────────
// GET /articles
// Query: page, limit, search, status
export function getArticles(req, res) {
  const page   = parseInt(req.query.page)   || 1;
  const limit  = parseInt(req.query.limit)  || 10;
  const search = req.query.search?.trim()   || "";
  const status = req.query.status           || "";

  // 필터링
  let filtered = articles;

  if (search) {
    filtered = filtered.filter(
      (a) =>
        a.title.includes(search) ||
        a.author.includes(search) ||
        a.category.includes(search),
    );
  }

  if (status) {
    filtered = filtered.filter((a) => a.status === status);
  }

  // 페이지네이션
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data  = filtered.slice(start, start + limit);

  // 통계 (전체 기사 기준, 필터 미적용)
  const stats = [
    { label: "전체 기사", value: String(articles.length),                                           delta: "+2 이번 주", color: "primary" },
    { label: "발행됨",    value: String(articles.filter((a) => a.status === "published").length),   delta: "+1 이번 주", color: "success" },
    { label: "임시저장",  value: String(articles.filter((a) => a.status === "draft").length),      delta: "0 이번 주",  color: "warning" },
    { label: "보관함",    value: String(articles.filter((a) => a.status === "archived").length),   delta: "0 이번 주",  color: "info"    },
  ];

  return res.json({ data, total, page, limit, stats });
}

// ── 기사 단건 조회 ─────────────────────────────
// GET /articles/:id
export function getArticle(req, res) {
  const article = articles.find((a) => a.id === parseInt(req.params.id));

  if (!article) {
    return res.status(404).json({ message: "기사를 찾을 수 없습니다." });
  }

  return res.json(article);
}

// ── 기사 생성 ──────────────────────────────────
// POST /articles
export function createArticle(req, res) {
  const { title, category, content, status, templateId, images } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "제목과 내용은 필수입니다." });
  }

  // 목업: 다음 id 생성 (실제 DB에서는 자동 처리)
  const newId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;

  const newArticle = {
    id:         newId,
    title,
    category:   category || "미분류",
    content,
    author:     req.user?.name || "Unknown",
    authorId:   req.user?.id   || "",
    status:     status || "draft",
    date:       new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(".", "."),
    templateId: templateId ?? null,
    images:     images ?? [],
  };

  articles.push(newArticle);

  return res.status(201).json(newArticle);
}

// ── 기사 수정 ──────────────────────────────────
// PUT /articles/:id
export function updateArticle(req, res) {
  const idx = articles.findIndex((a) => a.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ message: "기사를 찾을 수 없습니다." });
  }

  // 기존 데이터에 변경 내용을 덮어씀 (id는 변경 불가)
  articles[idx] = { ...articles[idx], ...req.body, id: articles[idx].id };

  return res.json(articles[idx]);
}

// ── 기사 삭제 ──────────────────────────────────
// DELETE /articles/:id
export function deleteArticle(req, res) {
  const idx = articles.findIndex((a) => a.id === parseInt(req.params.id));

  if (idx === -1) {
    return res.status(404).json({ message: "기사를 찾을 수 없습니다." });
  }

  articles.splice(idx, 1);

  return res.status(204).send(); // 204 No Content: 삭제 성공 시 응답 바디 없음
}
