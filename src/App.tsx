import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import Navbar from "@/components/layout/Navbar";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Editor from "@/pages/Editor";
import Templates from "@/pages/Templates";
import NotFound from "@/pages/NotFound";

function ProtectedRoute({ children, user }: { children: React.ReactNode; user: ReturnType<typeof useAuth>["user"] }) {
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function App() {
  const { user, login, register, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();

  return (
    <BrowserRouter>
      <Navbar
        user={user}
        isDark={isDark}
        onToggleDark={toggle}
        onLogout={logout}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/auth"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Auth
                onLogin={login}
                onRegister={(name, email, password) => { register(name, email, password); }}
              />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute user={user}>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute user={user}>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route path="/templates" element={<Templates />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
