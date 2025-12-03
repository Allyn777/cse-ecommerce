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
import Favorites from "./components/Favorites";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ Import ProtectedRoute
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected user routes - require login */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/product" 
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wishlists" 
            element={
              <ProtectedRoute>
                <Wishlists />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fightinggearsorder" 
            element={
              <ProtectedRoute>
                <FightingGearsOrder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profilepage" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
          path="/favorites" 
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } 
        />

          {/* ✅ Admin route - ONLY admins can access */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* 404 fallback */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;