import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductDisplay from './ProductDisplay';
import { getValidationErrors } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
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
    
    const validationErrors = getValidationErrors(formData, true);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        const { data, error } = await signUp(formData.email, formData.password);
        
        if (error) {
          setErrors({ general: error.message });
        } else {
          setSuccessMessage('Account created successfully! Please check your email to verify your account.');
          console.log('Signup successful:', data);
          // Clear form after successful signup
          setFormData({
            email: '',
            password: '',
            confirmPassword: ''
          });
        }
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl" >
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row">
            {/* Signup Form - Left Side */}
            <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8 xl:p-12 bg-[#121212]">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Create your account
                </h1>
                <p className="text-gray-300 mb-8">
                  Enter your email below to create your account
                </p>
                
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
                      className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">
                      We'll use this to contact you. We will not share your email with anyone else.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Password"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-[#FFFFFF] text-gray-900 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Confirm Password"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-gray-400 text-xs">
                      Must be at least 8 characters long.
                    </p>
                    {errors.password && (
                      <p className="text-red-400 text-xs">{errors.password}</p>
                    )}
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
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
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-300 text-sm">
                    Already have an account?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-white hover:text-blue-400 transition-colors font-medium"
                    >
                      Sign in
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

export default Signup;
