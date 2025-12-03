import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Get product from navigation state or fetch from Supabase
  useEffect(() => {
    if (location.state?.product) {
      // Product passed via navigation
      const prod = location.state.product;
      setProduct(prod);
      
      // Set default selections
      if (prod.sizes && prod.sizes.length > 0) {
        setSelectedSize(prod.sizes[0]);
      }
      if (prod.colors && prod.colors.length > 0) {
        setSelectedColor(prod.colors[0]);
      }
      setLoading(false);
    } else {
      // Fallback: You could fetch product by ID from URL params
      loadProductFromUrl();
    }
  }, [location]);

  const loadProductFromUrl = async () => {
    // If you want to support direct URLs like /product/:id
    // You'd need to add this route to App.jsx: <Route path="/product/:id" element={<ProductDetail />} />
    setLoading(false);
    // For now, redirect to marketplace if no product data
    navigate('/marketplace');
  };

  // Add to Cart function
  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!product) return;

    // Validate size/color selection if required
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    setAddingToCart(true);

    try {
      // Check if item already exists in cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .eq('selected_size', selectedSize || null)
        .eq('selected_color', selectedColor || null)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity 
          })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new cart item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            selected_size: selectedSize || null,
            selected_color: selectedColor || null
          }]);

        if (insertError) throw insertError;
      }

      alert('Added to cart successfully!');
      // Optionally navigate to cart or wishlists page
      // navigate('/wishlists');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart: ' + error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  // Add to Wishlist function
  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      // Check if already in wishlist
      const { data: existing, error: fetchError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existing) {
        alert('Already in wishlist!');
        return;
      }

      // Add to wishlist
      const { error: insertError } = await supabase
        .from('wishlists')
        .insert([{
          user_id: user.id,
          product_id: product.id
        }]);

      if (insertError) throw insertError;

      alert('Added to wishlist successfully!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Error adding to wishlist: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <button 
            onClick={() => navigate('/marketplace')}
            className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // Parse sizes and colors from JSONB
  const sizes = product.sizes || [];
  const colors = product.colors || [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-black text-white py-2 sm:py-3 md:py-4 px-3 sm:px-6 md:px-8 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/marketplace')}
            className="text-white hover:text-gray-300 transition-colors p-2 sm:p-3 rounded-full"
          >
            <svg className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Centered Title + Logo */}
          <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-1 sm:space-x-2 md:space-x-3">
            <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold whitespace-nowrap">
              Welcome to Fighting Gears
            </h1>
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center">
              <img src="/logos/boxing.png" alt="Logo" className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-7 lg:h-7" />
            </div>
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={handleAddToWishlist}
            className="text-white hover:text-gray-300 transition-colors p-2 sm:p-3 rounded-full"
          >
            <svg className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {/* Mobile/Tablet Back Button & Title */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:text-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-black">Product Details</h2>
          <div className="w-6 h-6"></div>
        </div>

        {/* Desktop Title */}
        <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-black mb-8">Product Details</h2>

        {/* Product Detail Container */}
        <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12 border border-gray-200 p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
          
          {/* Left Column: Image */}
          <div className="mb-6 md:mb-0 relative border border-gray-200 rounded-lg p-4 sm:p-6 flex items-center justify-center bg-gray-50">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full h-auto object-contain max-h-[400px]"
            />
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">{product.name}</h1>
            
            {/* Brand */}
            <p className="text-sm text-gray-600 mb-2">Brand: {product.brand}</p>
            
            {/* Price */}
            <p className="text-xl sm:text-2xl font-bold text-black border-b border-gray-200 pb-4 mb-4">
              ₱{parseFloat(product.price).toLocaleString()}
            </p>

            {/* Stock Status */}
            <div className="mb-4">
              {product.stock > 0 ? (
                <p className="text-sm text-green-600 font-medium">
                  In Stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-sm text-red-600 font-medium">Out of Stock</p>
              )}
            </div>

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 sm:px-4 py-1 border rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 sm:px-4 py-1 border rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-200 pb-4 mb-4 flex-grow">
              <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>

            {/* Add to Cart Button */}
            <div className="fixed inset-x-0 bottom-0 md:static bg-white md:bg-transparent p-4 md:p-0 shadow-lg md:shadow-none border-t md:border-t-0 border-gray-200 z-10">
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-base font-semibold uppercase disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addingToCart ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6 sm:py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;