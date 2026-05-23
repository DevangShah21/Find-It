import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import LostItems from "./pages/LostItems.jsx";
import FoundItems from "./pages/FoundItems.jsx";
import ReportItem from "./pages/ReportItem.jsx";
import About from "./pages/About.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import SignUp from "./pages/auth/SignUp.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import "./styles/main.css";

// Pages with their own full-screen layout (no shared Navbar/Footer)
const FULL_SCREEN = ["/dashboard", "/admin", "/signin", "/signup"];

function Layout() {
  const { pathname } = useLocation();
  const isFullScreen = FULL_SCREEN.some((p) => pathname.startsWith(p));
  const showSearch = pathname === "/lost" || pathname === "/found";

  return (
    <>
      {!isFullScreen && <Navbar showSearch={showSearch} />}
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/lost" element={<LostItems />} />
          <Route path="/found" element={<FoundItems />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Auth required */}
          <Route path="/report" element={<RequireAuth><ReportItem /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />

          {/* Admin only */}
          <Route path="/admin/*" element={<RequireAdmin><AdminPanel /></RequireAdmin>} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ textAlign: "center", padding: "100px 24px" }}>
              <div style={{ fontSize: "4rem" }}>404</div>
              <h2 style={{ fontFamily: "var(--font-display)", color: "var(--navy)", margin: "16px 0 8px" }}>Page not found</h2>
              <a href="/" className="btn btn-primary" style={{ display: "inline-flex", marginTop: 16 }}>← Go Home</a>
            </div>
          } />
        </Routes>
      </main>
      {!isFullScreen && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
