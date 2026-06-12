import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import styles from "./Login.module.css";

// ============================================
// Login - 로그인 페이지
//
// 이 페이지는 AppLayout(사이드바/탑바) 바깥에 렌더링됩니다.
// 로그인 성공 → AuthContext의 user 상태가 채워짐
//             → App.jsx의 ProtectedLayout이 감지해서 대시보드로 이동
// ============================================

// 개발용 테스트 계정 안내
const TEST_ACCOUNTS = [
  { id: "editor01",   pw: "1234",      role: "선임 에디터" },
  { id: "reporter01", pw: "1234",      role: "기자" },
  { id: "admin",      pw: "admin1234", role: "관리자" },
];

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [id, setId]           = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 상태면 대시보드로 바로 이동
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼의 기본 동작(페이지 새로고침) 막기
    if (!id || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login({ id, password }); // AuthContext의 login() 호출
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 테스트 계정 클릭 시 자동 입력
  const fillAccount = (account) => {
    setId(account.id);
    setPassword(account.pw);
    setError("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* 로고 */}
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>M</div>
          <span className={styles.logoText}>WEBZINE</span>
        </div>

        <h1 className={styles.title}>로그인</h1>
        <p className={styles.subtitle}>계속하려면 로그인하세요.</p>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-id">아이디</label>
            <input
              id="login-id"
              className="form-input"
              type="text"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-pw">비밀번호</label>
            <input
              id="login-pw"
              className="form-input"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* 에러 메시지 */}
          {error && <p className={styles.error}>{error}</p>}

          <button
            className={`btn btn-primary ${styles.submitBtn}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 개발용 테스트 계정 안내 */}
        <div className={styles.devAccounts}>
          <p className={styles.devLabel}>개발용 테스트 계정</p>
          <div className={styles.accountList}>
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                className={styles.accountChip}
                type="button"
                onClick={() => fillAccount(acc)}
              >
                <strong>{acc.id}</strong>
                <span>{acc.role}</span>
              </button>
            ))}
          </div>
          <p className={styles.devHint}>계정을 클릭하면 자동으로 입력됩니다.</p>
        </div>

      </div>
    </div>
  );
}

export default Login;
