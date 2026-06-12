import subscribers from "../data/subscribers.js";

// ============================================
// subscriberController - 구독자 관련 로직
//
// 실제 DB 연동 시:
//   subscribers 배열 → ORM(Prisma, Mongoose 등) 쿼리로 교체
//   id 자동 생성 → DB auto-increment / ObjectId로 교체
// ============================================

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextId() {
  return subscribers.length > 0 ? Math.max(...subscribers.map((s) => s.id)) + 1 : 1;
}

// ── 관리자: 구독자 목록 조회 ───────────────────
// GET /subscribers
// Query: page, limit, search, status
export function getSubscribers(req, res) {
  const page   = parseInt(req.query.page)  || 1;
  const limit  = parseInt(req.query.limit) || 10;
  const search = req.query.search?.trim()  || "";
  const status = req.query.status          || "";

  let filtered = subscribers;

  if (search) {
    filtered = filtered.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));
  }
  if (status) {
    filtered = filtered.filter((s) => s.status === status);
  }

  const total = filtered.length;
  const data  = filtered.slice((page - 1) * limit, page * limit);

  const stats = {
    total:    subscribers.length,
    active:   subscribers.filter((s) => s.status === "active").length,
    inactive: subscribers.filter((s) => s.status === "inactive").length,
  };

  return res.json({ data, total, page, limit, stats });
}

// ── 관리자: 구독자 단건 조회 ───────────────────
// GET /subscribers/:id
export function getSubscriber(req, res) {
  const id  = parseInt(req.params.id);
  const sub = subscribers.find((s) => s.id === id);

  if (!sub) {
    return res.status(404).json({ message: "구독자를 찾을 수 없습니다." });
  }

  return res.json(sub);
}

// ── 관리자: 구독자 등록 ────────────────────────
// POST /subscribers
// Body: { email }
export function createSubscriber(req, res) {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해주세요." });
  }

  const existing = subscribers.find((s) => s.email.toLowerCase() === email);

  if (existing) {
    if (existing.status === "active") {
      return res.status(409).json({ message: "이미 구독 중인 이메일입니다." });
    }
    // 비활성 → 재활성화
    existing.status        = "active";
    existing.subscribedAt  = today();
    existing.unsubscribedAt = null;
    return res.json(existing);
  }

  const newRecord = {
    id: nextId(),
    email,
    status: "active",
    subscribedAt: today(),
    unsubscribedAt: null,
  };
  subscribers.unshift(newRecord);
  return res.status(201).json(newRecord);
}

// ── 관리자: 비활성화 ───────────────────────────
// PATCH /subscribers/:id/deactivate
export function deactivateSubscriber(req, res) {
  const id  = parseInt(req.params.id);
  const sub = subscribers.find((s) => s.id === id);

  if (!sub) {
    return res.status(404).json({ message: "구독자를 찾을 수 없습니다." });
  }

  sub.status         = "inactive";
  sub.unsubscribedAt = today();
  return res.json(sub);
}

// ── 관리자: 활성화 ─────────────────────────────
// PATCH /subscribers/:id/activate
export function activateSubscriber(req, res) {
  const id  = parseInt(req.params.id);
  const sub = subscribers.find((s) => s.id === id);

  if (!sub) {
    return res.status(404).json({ message: "구독자를 찾을 수 없습니다." });
  }

  sub.status         = "active";
  sub.subscribedAt   = today();
  sub.unsubscribedAt = null;
  return res.json(sub);
}

// ── 관리자: 일괄 처리 ─────────────────────────
// POST /subscribers/bulk
// Body: { action: "activate"|"deactivate", ids: [1, 2, ...] }
export function bulkAction(req, res) {
  const { action, ids } = req.body;

  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "action과 ids가 필요합니다." });
  }
  if (!["activate", "deactivate"].includes(action)) {
    return res.status(400).json({ message: "action은 activate 또는 deactivate 이어야 합니다." });
  }

  ids.forEach((id) => {
    const sub = subscribers.find((s) => s.id === parseInt(id));
    if (!sub) return;

    if (action === "deactivate" && sub.status === "active") {
      sub.status         = "inactive";
      sub.unsubscribedAt = today();
    } else if (action === "activate" && sub.status === "inactive") {
      sub.status         = "active";
      sub.subscribedAt   = today();
      sub.unsubscribedAt = null;
    }
  });

  return res.json({ message: `${ids.length}건 처리 완료` });
}

// ── 공개: 구독 신청 ────────────────────────────
// POST /subscribers/public/subscribe
// Body: { email }
export function publicSubscribe(req, res) {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해주세요." });
  }

  const existing = subscribers.find((s) => s.email.toLowerCase() === email);

  if (existing) {
    if (existing.status === "active") {
      return res.status(409).json({ message: "이미 구독 중인 이메일입니다." });
    }
    existing.status         = "active";
    existing.subscribedAt   = today();
    existing.unsubscribedAt = null;
    return res.json({ reactivated: true });
  }

  subscribers.push({
    id: nextId(),
    email,
    status: "active",
    subscribedAt: today(),
    unsubscribedAt: null,
  });

  return res.status(201).json({ reactivated: false });
}

// ── 공개: 구독 취소 ────────────────────────────
// POST /subscribers/public/unsubscribe
// Body: { email }
export function publicUnsubscribe(req, res) {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ message: "이메일을 입력해주세요." });
  }

  const existing = subscribers.find((s) => s.email.toLowerCase() === email);

  if (!existing || existing.status === "inactive") {
    return res.status(404).json({ message: "구독 중인 이메일을 찾을 수 없습니다." });
  }

  existing.status         = "inactive";
  existing.unsubscribedAt = today();
  return res.json({ message: "구독이 취소되었습니다." });
}
