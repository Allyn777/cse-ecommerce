import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Marketplace from "./components/Marketplace";
import ProductDetail from "./components/ProductDetail";
import Wishlists from "./components/Wishlists";
import FightingGearsOrder from "./components/FightingGearsOrder";
import ProfilePage from "./components/ProfilePage";
import AdminDashboard from "./components/AdminDashboard"; // ✅ added this
import { AuthProvider } from "./contexts/AuthContext"; // ✅ already correct

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Logged-in routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product" element={<ProductDetail />} />
          <Route path="/wishlists" element={<Wishlists />} />
          <Route path="/fightinggearsorder" element={<FightingGearsOrder />} />
          <Route path="/profilepage" element={<ProfilePage />} />



          {/* ✅ Admin route */}
          <Route path="/admin" element={<AdminDashboard />} />
          {/* 404 fallback */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
