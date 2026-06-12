import jwt from "jsonwebtoken";
import users from "../data/users.js";

// ============================================
// authController - 인증 관련 로직
//
// 컨트롤러란?
//   실제 비즈니스 로직이 담기는 곳입니다.
//   - 요청 데이터 꺼내기 (req.body, req.params)
//   - 데이터 처리 (DB 조회, 계산 등)
//   - 응답 보내기 (res.json, res.status)
// ============================================

// ── 로그인 ────────────────────────────────────
// POST /auth/login
// Body: { id, password }
export function login(req, res) {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
  }

  // 유저 조회 (실제 DB에서는 User.findOne({ id }) 등으로 교체)
  const user = users.find((u) => u.id === id);

  // TODO: 실제 운영 시 bcrypt.compare(password, user.password) 로 교체
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  // JWT 발급
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  // 비밀번호는 응답에서 제외
  const { password: _pw, ...userWithoutPassword } = user;

  return res.json({ token, user: userWithoutPassword });
}

// ── 로그아웃 ──────────────────────────────────
// POST /auth/logout
// JWT는 서버에 저장되지 않으므로 클라이언트가 토큰을 삭제하면 됩니다.
// 실제 운영 시 토큰 블랙리스트(Redis 등)가 필요하면 여기서 처리합니다.
export function logout(req, res) {
  return res.json({ message: "로그아웃 되었습니다." });
}

// ── 내 정보 조회 ───────────────────────────────
// GET /auth/me
// authMiddleware가 먼저 실행되어 req.user에 디코딩된 유저 정보가 담겨 있습니다.
export function getMe(req, res) {
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
  }

  const { password: _pw, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
}
