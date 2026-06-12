import jwt from "jsonwebtoken";

// ============================================
// authMiddleware - JWT 인증 검사 미들웨어
//
// 미들웨어란?
//   요청(Request)이 컨트롤러에 도달하기 전에
//   중간에서 실행되는 함수입니다.
//   next()를 호출하면 다음 단계로 진행하고,
//   호출하지 않으면 요청이 여기서 멈춥니다.
//
// 사용법 (routes에서):
//   router.get("/me", authMiddleware, authController.getMe);
//   → 로그인한 사용자만 /me 에 접근 가능
// ============================================

export default function authMiddleware(req, res, next) {
  // Authorization 헤더에서 토큰 꺼내기
  // 형식: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "인증 토큰이 없습니다." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 토큰 검증 및 디코딩
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, role } → 이후 컨트롤러에서 req.user로 접근
    next();
  } catch {
    return res.status(401).json({ message: "토큰이 유효하지 않거나 만료되었습니다." });
  }
}
