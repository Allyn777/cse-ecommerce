import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const Marketplace = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Categories data (static)
  const categories = [
    { id: 1, name: "Gloves", icon: "🥊", image: "/logos/venum-gloves.png", value: "gloves" },
    { id: 2, name: "Punch Mits", icon: "👊", image: "/logos/everlastmits0.png", value: "punch-mits" },
    { id: 3, name: "Mouth Guard", icon: "🦷", image: "/logos/hayabusam.png", value: "mouthguard" },
    { id: 4, name: "Shin Guard", icon: "🦵", image: "/logos/twinshpd.png", value: "shin-guard" },
    { id: 5, name: "Punching Bag", icon: "🎯", image: "/logos/wesingbag0.png", value: "punching-bag" }
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Fetch products from Supabase
  useEffect(() => {
    loadProducts();
  }, []);

  // Load counts for badges
  useEffect(() => {
    if (user) {
      loadCounts();
    }
  }, [user, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      // Get wishlist count
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (wishlistError) throw wishlistError;
      setWishlistCount(wishlistData?.length || 0);

      // Get cart count
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (cartError) throw cartError;
      setCartCount(cartData?.length || 0);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  // Group products by category
  const getProductsByCategory = (category) => {
    return products.filter(p => p.category === category);
  };

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 text-center hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="aspect-square flex items-center justify-center mb-3 flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div className="flex-grow flex flex-col">
        <h3 className="text-xs sm:text-sm font-semibold text-black mb-2 line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 flex-shrink-0">
          ₱{parseFloat(product.price).toLocaleString()}
        </p>
        {product.stock > 0 ? (
          <button 
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm mt-auto"
            onClick={() => navigate('/product', { state: { product } })}
          >
            Buy now
          </button>
        ) : (
          <button 
            className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed text-xs sm:text-sm mt-auto"
            disabled
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );

  // Category Section Component
  const CategorySection = ({ category, categoryValue }) => {
    const categoryProducts = getProductsByCategory(categoryValue);
    
    if (categoryProducts.length === 0) return null;

    return (
      <section className="py-6 sm:py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">{category}</h2>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-sm text-gray-600">{categoryProducts.length} items</span>
              <button className="text-gray-600 hover:text-black transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">Welcome to Fighting Gears</h1>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <img src="/logos/boxing.png" alt="Logo" className="w-6 h-6" />
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/marketplace')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 py-3 sm:py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button 
              onClick={() => navigate('/favorites')}
              className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black transition-colors relative"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-medium text-sm sm:text-base">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => navigate('/profilepage')}
              className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-sm sm:text-base">Profile</span>
            </button>
            
            {user && (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium text-sm sm:text-base transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-normal">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full sm:w-64 md:w-80 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
              />
            </div>
            
            <button 
              className="relative p-2 text-gray-600 hover:text-black transition-colors"
              onClick={() => navigate('/wishlists')}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Browse By Category */}
      <section className="py-8 sm:py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 sm:mb-8">Browse By Category</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-black">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {loading && (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      )}

      {!loading && (
        <>
          <CategorySection category="Gloves" categoryValue="gloves" />
          <CategorySection category="Punch Mits" categoryValue="punch-mits" />
          <CategorySection category="Mouthguard" categoryValue="mouthguard" />
          <CategorySection category="Shin Guard" categoryValue="shin-guard" />
          <CategorySection category="Punching Bag" categoryValue="punching-bag" />
        </>
      )}

      {!loading && products.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600 text-lg">No products available yet.</p>
          <p className="text-gray-500 text-sm mt-2">Check back soon!</p>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white py-6 sm:py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;