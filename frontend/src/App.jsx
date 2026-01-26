import { Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "./hooks/useSession";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Handshake from "./pages/Handshake";
import Chat from "./pages/Chat";
import Call from "./pages/Call";
import History from "./pages/History";

/* ---------------------------------
   Protected Route Wrapper
---------------------------------- */
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const { isAuthenticated, loading } = useSession();

  // ⏳ IMPORTANT: wait until session is checked
  if (loading) return null;

  return (
    <Routes>
      {/* ---------------- PUBLIC ROUTES ---------------- */}

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/chat" replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/chat" replace /> : <Register />
        }
      />

      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/chat" replace /> : <Handshake />
        }
      />

      {/* ---------------- PROTECTED ROUTES ---------------- */}

      <Route
        path="/chat"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/call"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Call />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <History />
          </ProtectedRoute>
        }
      />

      {/* ---------------- FALLBACK ---------------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
