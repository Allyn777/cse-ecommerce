import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setLoading(false);
        return;
      }

      setUser(session.user);

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, status')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      // Check if user is active
      if (profile.status !== 'active') {
        console.log('User account is not active');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setUserRole(profile.role);
      setLoading(false);
    } catch (error) {
      console.error('Error in checkUser:', error);
      setLoading(false);
    }
  };

  // Show loading spinner while checking
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin and user is not admin, redirect to home
  if (requireAdmin && userRole !== 'admin') {
    console.log('🚫 Access Denied: User is not an admin');
    return <Navigate to="/home" replace />;
  }

  // User is authenticated and has correct role
  return children;
};

export default ProtectedRoute;