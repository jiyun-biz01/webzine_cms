import { supabase } from "../lib/supabase.js";

function toClient(a) {
  return {
    id:          a.id,
    title:       a.title,
    category:    a.category,
    status:      a.status,
    content:     a.content,
    templateId:  a.template_id,
    authorId:    a.author_id,
    author:      a.author ?? null,
    images:      (a.images ?? []).map((img) => ({
      id:        img.id,
      articleId: img.article_id,
      slot:      img.slot,
      url:       img.url,
      name:      img.name,
    })),
    publishedAt: a.published_at,
    createdAt:   a.created_at,
    updatedAt:   a.updated_at,
  };
}

// GET /articles
// Query: page, limit, search, status
export async function getArticles(req, res) {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const search = req.query.search?.trim()  || "";
  const status = req.query.status          || "";

  let query = supabase
    .from("articles")
    .select("*, author:users(id, name)", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (search) query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return res.status(500).json({ message: error.message });

  // 통계 (전체 기사 기준)
  const { data: statsData } = await supabase
    .from("articles")
    .select("status");

  const all       = statsData || [];
  const stats = [
    { label: "전체 기사", value: String(all.length),                                          delta: "", color: "primary" },
    { label: "발행됨",    value: String(all.filter((a) => a.status === "published").length),  delta: "", color: "success" },
    { label: "임시저장",  value: String(all.filter((a) => a.status === "draft").length),      delta: "", color: "warning" },
    { label: "보관함",    value: String(all.filter((a) => a.status === "archived").length),   delta: "", color: "info"    },
  ];

  return res.json({ data: data.map(toClient), total: count, page, limit, stats });
}

// GET /articles/:id
export async function getArticle(req, res) {
  const { data: article, error } = await supabase
    .from("articles")
    .select("*, author:users(id, name), images:article_images(*)")
    .eq("id", req.params.id)
    .single();

  if (error || !article) {
    return res.status(404).json({ message: "기사를 찾을 수 없습니다." });
  }

  return res.json(toClient(article));
}

// POST /articles
export async function createArticle(req, res) {
  const { title, category, content, status, templateId, images } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "제목과 내용은 필수입니다." });
  }

  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      title,
      category:    category || "미분류",
      content,
      author_id:   req.user?.id || null,
      status:      status || "draft",
      template_id: templateId ?? null,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  // 이미지 슬롯 저장
  if (images?.length) {
    const imageRows = images.map((img) => ({
      article_id: article.id,
      slot:       img.slot,
      url:        img.url || null,
      name:       img.name || null,
    }));
    await supabase.from("article_images").insert(imageRows);
  }

  return res.status(201).json(toClient(article));
}

// PUT /articles/:id
export async function updateArticle(req, res) {
  const { images, templateId, ...fields } = req.body;

  const updateData = {
    ...fields,
    template_id: templateId ?? fields.template_id ?? null,
    updated_at:  new Date().toISOString(),
  };

  if (fields.status === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { data: article, error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !article) {
    return res.status(404).json({ message: "기사를 찾을 수 없습니다." });
  }

  // 이미지 슬롯 교체
  if (images !== undefined) {
    await supabase.from("article_images").delete().eq("article_id", article.id);
    if (images.length) {
      const imageRows = images.map((img) => ({
        article_id: article.id,
        slot:       img.slot,
        url:        img.url || null,
        name:       img.name || null,
      }));
      await supabase.from("article_images").insert(imageRows);
    }
  }

  return res.json(toClient(article));
}

// DELETE /articles/:id
export async function deleteArticle(req, res) {
  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ message: error.message });

  return res.status(204).send();
}
