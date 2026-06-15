import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ArticleList from "@/pages/ArticleList";
import ArticleWrite from "@/pages/ArticleWrite";
import ArticleView from "@/pages/ArticleView";
import MainPageConfig from "@/pages/MainPageConfig";
import WebzineHistory from "@/pages/WebzineHistory";
import TemplateList from "@/pages/TemplateList";
import SubscriberList from "@/pages/SubscriberList";
import SubscriberDetail from "@/pages/SubscriberDetail";
import SubscriberStats from "@/pages/SubscriberStats";
import SubscribePage from "@/pages/SubscribePage";
import ArticlePreview from "@/pages/ArticlePreview";
import NotFound from "@/pages/NotFound";
import CategoryList from "@/pages/CategoryList";

// ============================================
// ProtectedLayout - 로그인이 필요한 페이지들의 공통 래퍼
//
// user가 없으면(로그인 안 된 상태) → /login으로 이동
// user가 있으면 → AppLayout(사이드바+탑바) 안에서 자식 페이지 렌더링
//
// <Outlet /> 이란?
//   React Router에서 "자식 Route의 컴포넌트를 여기에 렌더링하라"는 표시입니다.
//   AppLayout 안에 현재 URL에 맞는 페이지가 들어오는 자리입니다.
// ============================================
function ProtectedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

// ============================================
// App - 전체 라우트 구조
//
// /login          → Login (레이아웃 없음, 누구나 접근 가능)
// 그 외 모든 경로 → ProtectedLayout (로그인 필요)
//                    └─ AppLayout (사이드바 + 탑바)
//                         └─ 각 페이지 컴포넌트
//
// 새 페이지 추가 방법:
//   1. src/pages/ 에 컴포넌트 파일 생성
//   2. 아래 import 추가
//   3. ProtectedLayout 안에 <Route> 한 줄 추가
// ============================================
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 로그인 페이지 - 사이드바 없이 단독 렌더링 */}
          <Route path="/login" element={<Login />} />

          {/* 미리보기 - 사이드바 없이 새 창에서 열림 */}
          <Route path="/articles/preview/:id" element={<ArticlePreview />} />

          {/* 공개 구독 페이지 - 로그인 불필요, AppLayout 없음 */}
          <Route path="/subscribe" element={<SubscribePage />} />

          {/* 보호된 페이지들 - 로그인 필요 */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<Dashboard />} />

            {/* 기사 관리 */}
            <Route path="/articles"           element={<ArticleList />} />
            <Route path="/articles/published" element={<ArticleList />} />
            <Route path="/articles/drafts"    element={<ArticleList />} />
            <Route path="/articles/archived"  element={<ArticleList />} />
            <Route path="/articles/write"     element={<ArticleWrite />} />
            <Route path="/articles/edit/:id"  element={<ArticleWrite />} />
            <Route path="/articles/:id"       element={<ArticleView />} />

            <Route path="/main-page" element={<MainPageConfig />} />
            <Route path="/main-page/history" element={<WebzineHistory />} />

            {/* 디자인 템플릿 */}
            <Route path="/templates" element={<TemplateList />} />

            {/* 구독자 관리 */}
            <Route path="/subscribers"        element={<SubscriberList />} />
            <Route path="/subscribers/stats" element={<SubscriberStats />} />
            <Route path="/subscribers/:id"   element={<SubscriberDetail />} />

            {/* 카테고리 관리 */}
            <Route path="/categories" element={<CategoryList />} />

            {/* 추후 추가 예정 */}
            {/* <Route path="/media"       element={<MediaLibrary />} /> */}
            {/* <Route path="/users"       element={<UserList />} /> */}
            {/* <Route path="/settings"    element={<Settings />} /> */}
          </Route>

          {/* 404 - 매칭되는 라우트 없을 때 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
