// ============================================
// 목업 유저 데이터
//
// 실제 DB 연동 시 이 파일을 User 모델/쿼리로 교체하세요.
// 비밀번호는 실제 운영 시 반드시 bcrypt 등으로 해싱해야 합니다.
// ============================================

const users = [
  {
    id: "editor01",
    name: "김편집",
    password: "1234",          // TODO: 운영 시 bcrypt 해싱 필수
    role: "선임 에디터",
    avatar: "김",
    lastLogin: "2025.05.06 09:32",
  },
  {
    id: "reporter01",
    name: "이기자",
    password: "1234",
    role: "기자",
    avatar: "이",
    lastLogin: "2025.05.05 14:10",
  },
  {
    id: "admin",
    name: "관리자",
    password: "admin1234",
    role: "관리자",
    avatar: "관",
    lastLogin: "2025.05.07 08:00",
  },
];

export default users;
