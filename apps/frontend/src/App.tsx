import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth-context';
import { ApiKeysPage } from './pages/ApiKeysPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function Protected({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/documents"
        element={
          <Protected>
            <DocumentsPage />
          </Protected>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <Protected>
            <DocumentDetailPage />
          </Protected>
        }
      />
      <Route
        path="/api-keys"
        element={
          <Protected>
            <ApiKeysPage />
          </Protected>
        }
      />
      <Route path="/" element={<Navigate to="/documents" replace />} />
    </Routes>
  );
}
