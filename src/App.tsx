import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, Outlet } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { KakaoCallbackHandler } from './components/auth/KakaoCallbackHandler';
import { PublicRoute } from './components/auth/PublicRoute';

// 보호된 레이아웃 래퍼
const ProtectedLayout = () => {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </MainLayout>
  );
};

// 루트 경로 로직 처리 (주로 OAuth 콜백용)
const RootHandler = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // OAuth 코드가 있으면 처리
  if (code && !accessToken) {
    return <KakaoCallbackHandler />;
  }

  // 로그인 상태면 대시보드 표시, 아니면 로그인 페이지로 리다이렉트
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardPage />
      </Suspense>
    </MainLayout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 공개 인증 경로 */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

          {/* OAuth 콜백을 위해 루트 경로는 별도로 처리 */}
          <Route path="/" element={<RootHandler />} />

          {/* 보호된 경로 래퍼 */}
          <Route element={<ProtectedLayout />}>
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<div>Calendar Page (Coming Soon)</div>} />
            <Route path="/analytics" element={<div>Analytics Page (Coming Soon)</div>} />
            <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
          </Route>
          
          {/* 예외 처리 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
