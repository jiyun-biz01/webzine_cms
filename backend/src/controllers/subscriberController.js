import { supabase } from "../lib/supabase.js";

// GET /subscribers
export async function getSubscribers(req, res) {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const search = req.query.search?.trim()  || "";
  const status = req.query.status          || "";

  let query = supabase
    .from("subscribers")
    .select("*", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("email", `%${search}%`);

  const { data, count, error } = await query
    .order("subscribed_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return res.status(500).json({ message: error.message });

  const { data: statsData } = await supabase.from("subscribers").select("status");
  const all = statsData || [];
  const stats = {
    total:    all.length,
    active:   all.filter((s) => s.status === "active").length,
    inactive: all.filter((s) => s.status === "inactive").length,
  };

  return res.json({ data, total: count, page, limit, stats });
}

// GET /subscribers/:id
export async function getSubscriber(req, res) {
  const { data: sub, error } = await supabase
    .from("subscribers")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !sub) {
    return res.status(404).json({ message: "구독자를 찾을 수 없습니다." });
  }

  return res.json(sub);
}

// POST /subscribers
export async function createSubscriber(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ message: "이메일을 입력해주세요." });

  const { data: existing } = await supabase
    .from("subscribers")
    .select("*")
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.status === "active") {
      return res.status(409).json({ message: "이미 구독 중인 이메일입니다." });
    }
    const { data: updated } = await supabase
      .from("subscribers")
      .update({ status: "active", subscribed_at: new Date().toISOString(), unsubscribed_at: null })
      .eq("id", existing.id)
      .select()
      .single();
    return res.json(updated);
  }

  const { data: newSub, error } = await supabase
    .from("subscribers")
    .insert({ email, status: "active" })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.status(201).json(newSub);
}

// PATCH /subscribers/:id/deactivate
export async function deactivateSubscriber(req, res) {
  const { data: sub, error } = await supabase
    .from("subscribers")
    .update({ status: "inactive", unsubscribed_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !sub) return res.status(404).json({ message: "구독자를 찾을 수 없습니다." });
  return res.json(sub);
}

// PATCH /subscribers/:id/activate
export async function activateSubscriber(req, res) {
  const { data: sub, error } = await supabase
    .from("subscribers")
    .update({ status: "active", subscribed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !sub) return res.status(404).json({ message: "구독자를 찾을 수 없습니다." });
  return res.json(sub);
}

// POST /subscribers/bulk
export async function bulkAction(req, res) {
  const { action, ids } = req.body;

  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "action과 ids가 필요합니다." });
  }
  if (!["activate", "deactivate"].includes(action)) {
    return res.status(400).json({ message: "action은 activate 또는 deactivate 이어야 합니다." });
  }

  const updateData = action === "deactivate"
    ? { status: "inactive", unsubscribed_at: new Date().toISOString() }
    : { status: "active",   subscribed_at:   new Date().toISOString(), unsubscribed_at: null };

  const { error } = await supabase
    .from("subscribers")
    .update(updateData)
    .in("id", ids);

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ message: `${ids.length}건 처리 완료` });
}

// POST /subscribers/public/subscribe
export async function publicSubscribe(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ message: "이메일을 입력해주세요." });

  const { data: existing } = await supabase
    .from("subscribers")
    .select("*")
    .eq("email", email)
    .single();

  if (existing) {
    if (existing.status === "active") {
      return res.status(409).json({ message: "이미 구독 중인 이메일입니다." });
    }
    await supabase
      .from("subscribers")
      .update({ status: "active", subscribed_at: new Date().toISOString(), unsubscribed_at: null })
      .eq("id", existing.id);
    return res.json({ reactivated: true });
  }

  const { error } = await supabase
    .from("subscribers")
    .insert({ email, status: "active" });

  if (error) return res.status(500).json({ message: error.message });
  return res.status(201).json({ reactivated: false });
}

// POST /subscribers/public/unsubscribe
export async function publicUnsubscribe(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ message: "이메일을 입력해주세요." });

  const { data: existing } = await supabase
    .from("subscribers")
    .select("*")
    .eq("email", email)
    .single();

  if (!existing || existing.status === "inactive") {
    return res.status(404).json({ message: "구독 중인 이메일을 찾을 수 없습니다." });
  }

  await supabase
    .from("subscribers")
    .update({ status: "inactive", unsubscribed_at: new Date().toISOString() })
    .eq("id", existing.id);

  return res.json({ message: "구독이 취소되었습니다." });
}
