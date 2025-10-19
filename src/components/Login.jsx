import { useState } from 'react';
import ProductDisplay from './ProductDisplay';
import { getValidationErrors } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onSwitchToSignup }) => {
  const { signIn, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    login: '',
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');
    
    const validationErrors = getValidationErrors(formData, false);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        const { data, error } = await signIn(formData.login, formData.password);
        
        if (error) {
          setErrors({ general: error.message });
        } else {
          setSuccessMessage('Login successful! Redirecting...');
          console.log('Login successful:', data);
          // User will be automatically redirected via AuthContext
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    }
    
    setIsSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.login) {
      setErrors({ login: 'Please enter your email address first' });
      return;
    }
    
    try {
      const { error } = await resetPassword(formData.login);
      if (error) {
        setErrors({ general: error.message });
      } else {
        setSuccessMessage('Password reset email sent! Check your inbox.');
      }
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
            {/* Login Form - Left Side */}
            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8 xl:p-12 bg-[#121212]">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome back
                </h1>
                <p className="text-gray-300 mb-8">
                  Login to your CSE account
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="login" className="block text-white text-sm font-medium mb-2">
                      Login
                    </label>
                    <input
                      type="text"
                      id="login"
                      name="login"
                      value={formData.login}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.login ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your Email"
                      required
                    />
                    {errors.login && (
                      <p className="text-red-400 text-xs mt-1">{errors.login}</p>
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
                        Forgot your Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your password"
                      required
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
                    className="w-full bg-[#1C1C1C] hover:bg-[#1C1C1C] disabled:bg-[#1C1C1C] disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-300 text-sm">
                    Don't have account?{' '}
                    <button
                      onClick={onSwitchToSignup}
                      className="text-white hover:text-blue-400 transition-colors font-medium"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Product Display - Right Side */}
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
