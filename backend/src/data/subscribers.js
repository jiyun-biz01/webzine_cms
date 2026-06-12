// ============================================
// 목업 구독자 데이터
//
// 실제 DB 연동 시 이 파일을 Subscriber 모델/쿼리로 교체하세요.
// id는 DB에서 자동 생성되므로 실제 구현 시 제거하세요.
// ============================================

const subscribers = [
  { id: 1,  email: "kim.minjun@example.com",  status: "active",   subscribedAt: "2025-11-03", unsubscribedAt: null },
  { id: 2,  email: "lee.sooyeon@naver.com",    status: "active",   subscribedAt: "2025-11-15", unsubscribedAt: null },
  { id: 3,  email: "park.jiyoung@gmail.com",   status: "active",   subscribedAt: "2025-12-01", unsubscribedAt: null },
  { id: 4,  email: "choi.hyunwoo@kakao.com",   status: "inactive", subscribedAt: "2025-12-10", unsubscribedAt: "2026-01-05" },
  { id: 5,  email: "jung.eunji@daum.net",      status: "active",   subscribedAt: "2026-01-02", unsubscribedAt: null },
  { id: 6,  email: "han.seojun@example.com",   status: "active",   subscribedAt: "2026-01-18", unsubscribedAt: null },
  { id: 7,  email: "yoon.mirae@naver.com",     status: "inactive", subscribedAt: "2026-01-25", unsubscribedAt: "2026-02-14" },
  { id: 8,  email: "oh.taehyun@gmail.com",     status: "active",   subscribedAt: "2026-02-03", unsubscribedAt: null },
  { id: 9,  email: "shin.yuna@kakao.com",      status: "active",   subscribedAt: "2026-02-20", unsubscribedAt: null },
  { id: 10, email: "kwon.jisoo@daum.net",      status: "active",   subscribedAt: "2026-03-01", unsubscribedAt: null },
  { id: 11, email: "lim.dongwook@example.com", status: "active",   subscribedAt: "2026-03-10", unsubscribedAt: null },
  { id: 12, email: "bae.sujin@naver.com",      status: "inactive", subscribedAt: "2026-03-22", unsubscribedAt: "2026-04-01" },
  { id: 13, email: "cha.minho@gmail.com",      status: "active",   subscribedAt: "2026-04-05", unsubscribedAt: null },
  { id: 14, email: "go.areum@kakao.com",       status: "active",   subscribedAt: "2026-04-18", unsubscribedAt: null },
  { id: 15, email: "nam.kibum@daum.net",       status: "active",   subscribedAt: "2026-05-02", unsubscribedAt: null },
];

export default subscribers;
