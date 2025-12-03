import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import ProductsTab from "./admin/ProductsTab";
import OrdersTab from "./admin/OrdersTab";
import UsersTab from "./admin/UsersTab";
import PaymentsTab from "./admin/PaymentsTab";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    // ✅ Restore last active tab from localStorage
    return localStorage.getItem('adminActiveTab') || 'products';
  });
  const [adminName, setAdminName] = useState('Admin');

  // ✅ Load admin info on mount
  useEffect(() => {
    loadAdminInfo();
  }, []);

  // ✅ Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const loadAdminInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setAdminName(profile.full_name || profile.username || 'Admin');
        }
      }
    } catch (error) {
      console.error('Error loading admin info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear saved tab
      localStorage.removeItem('adminActiveTab');
      
      // Sign out
      await supabase.auth.signOut();
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-black text-white py-4 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate("/marketplace")}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {adminName}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-7xl mx-auto flex space-x-8">
          {["products", "orders", "payments", "users"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Contents */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "users" && <UsersTab />}
      </main>
    </div>
  );
}