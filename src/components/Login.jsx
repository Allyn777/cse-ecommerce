import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductDisplay from './ProductDisplay';
import { supabase } from '../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Please fill in all fields' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (authError) throw authError;

      // Step 2: Get user profile to check role
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, status, username')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        
        // If profile doesn't exist, it should have been created by trigger
        // Wait a moment and try again
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: retryProfileData, error: retryError } = await supabase
          .from('user_profiles')
          .select('role, status, username')
          .eq('id', authData.user.id)
          .single();
        
        if (retryError) {
          throw new Error('Your account is being set up. Please try logging in again in a moment.');
        }
        
        // Use retry data if successful
        if (retryProfileData) {
          // Update last login
          await supabase
            .from('user_profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', authData.user.id);
          
          setSuccessMessage('Login successful! Redirecting...');
          setTimeout(() => {
            if (retryProfileData.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/home');
            }
          }, 1000);
          return;
        }
      }

      // Step 3: Check if user is active
      if (profileData.status !== 'active') {
        throw new Error('Your account has been suspended. Please contact support.');
      }

      // Step 4: Update last login timestamp
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      // Step 5: Show success message
      const userRole = profileData.role;
      setSuccessMessage(`Welcome ${profileData.username || 'back'}! Redirecting...`);

      // Step 6: Redirect based on role
      setTimeout(() => {
        if (userRole === 'admin') {
          console.log('🔐 Admin login detected - Redirecting to /admin');
          navigate('/admin');
        } else {
          console.log('👤 User login detected - Redirecting to /home');
          navigate('/home');
        }
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.message || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccessMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row">

            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8 xl:p-12 bg-[#121212]">
              <div className="max-w-md mx-auto">

                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome back
                </h1>
                <p className="text-gray-300 mb-8">
                  Login to your Fighting Gears account
                </p>

                {/* FORM - Enter key works */}
                <form onSubmit={handleSubmit} className="space-y-6">

                  <div>
                    <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password" className="block text-white text-sm font-medium">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-white hover:text-blue-400 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {errors.general && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                      {errors.general}
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
                      {successMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1C1C1C] hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>

                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-300 text-sm">
                    Don't have an account?{' '}
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-white hover:text-blue-400 transition-colors font-medium"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>

                {/* Admin Login Hint */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <p className="text-xs text-gray-500 text-center">
                    💡 Admin accounts are created in Supabase Dashboard
                  </p>
                </div>

              </div>
            </div>

            <div className="lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8 xl:p-12">
              <ProductDisplay />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;