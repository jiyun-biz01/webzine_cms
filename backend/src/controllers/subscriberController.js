import { supabase } from "../lib/supabase.js";
import { createNotification } from "./notificationController.js";

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
    total:     all.length,
    active:    all.filter((s) => s.status === "active").length,
    inactive:  all.filter((s) => s.status === "inactive").length,
    cancelled: all.filter((s) => s.status === "cancelled").length,
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
  const email     = req.body.email?.trim().toLowerCase();
  const name      = req.body.name?.trim()      || null;
  const age_group = req.body.ageGroup?.trim()  || null;
  const region    = req.body.region?.trim()    || null;

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
      .update({ status: "active", subscribed_at: new Date().toISOString(), unsubscribed_at: null, name, age_group, region })
      .eq("id", existing.id)
      .select()
      .single();
    return res.json(updated);
  }

  const { data: newSub, error } = await supabase
    .from("subscribers")
    .insert({ email, status: "active", name, age_group, region })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  createNotification({
    type: "new_subscriber",
    message: `새 구독자 ${email}이 등록되었습니다.`,
    link: `/subscribers/${newSub.id}`,
  });

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

// PATCH /subscribers/:id/cancel
export async function cancelSubscriber(req, res) {
  const { data: sub, error } = await supabase
    .from("subscribers")
    .update({ status: "cancelled", unsubscribed_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error || !sub) return res.status(404).json({ message: "구독자를 찾을 수 없습니다." });

  createNotification({
    type: "subscriber_cancelled",
    message: `구독자 ${sub.email}이 구독을 취소했습니다.`,
    link: `/subscribers/${sub.id}`,
  });

  return res.json(sub);
}

// GET /subscribers/stats/demographics
export async function getDemographicsStats(_req, res) {
  const { data, error } = await supabase
    .from("subscribers")
    .select("age_group, region")
    .eq("status", "active");

  if (error) return res.status(500).json({ message: error.message });

  const ageCounts    = {};
  const regionCounts = {};

  data.forEach((sub) => {
    if (sub.age_group) ageCounts[sub.age_group]    = (ageCounts[sub.age_group]    || 0) + 1;
    if (sub.region)    regionCounts[sub.region]     = (regionCounts[sub.region]    || 0) + 1;
  });

  const ageGroups = ["10대", "20대", "30대", "40대", "50대", "60대 이상"].map((g) => ({
    label: g,
    count: ageCounts[g] || 0,
  }));

  const regions = Object.entries(regionCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return res.json({ ageGroups, regions });
}

// GET /subscribers/stats/monthly
export async function getMonthlyStats(_req, res) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("subscribers")
    .select("subscribed_at")
    .gte("subscribed_at", sixMonthsAgo.toISOString());

  if (error) return res.status(500).json({ message: error.message });

  const counts = {};
  data.forEach((sub) => {
    const month = sub.subscribed_at?.slice(0, 7);
    if (month) counts[month] = (counts[month] || 0) + 1;
  });

  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ month, count: counts[month] || 0 });
  }

  return res.json(result);
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
