
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image,
            stock,
            brand,
            description,
            sizes,
            colors
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === wishlistItems.filter(item => item.products?.stock > 0).length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        wishlistItems
          .filter(item => item.products?.stock > 0)
          .map(item => item.id)
      );
    }
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (selectedItems.length === 0) return;

    if (!confirm(`Remove ${selectedItems.length} item(s) from favorites?`)) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .in('id', selectedItems);

      if (error) throw error;

      setSelectedItems([]);
      loadWishlist();
      alert('Items removed from favorites');
    } catch (error) {
      console.error('Error deleting wishlist items:', error);
      alert('Error removing items: ' + error.message);
    }
  };

  const deleteItem = async (wishlistId) => {
    if (!confirm('Remove this item from favorites?')) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      loadWishlist();
      alert('Item removed from favorites');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error removing item: ' + error.message);
    }
  };

  // ✅ UPDATED: Add to cart AND remove from favorites
  const addToCart = async (wishlistItem) => {
    const product = wishlistItem.products;

    if (!product || product.stock <= 0) {
      alert('Product is out of stock');
      return;
    }

    try {
      const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
      const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;

      // Check if already in cart
      const { data: existing, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .eq('selected_size', defaultSize)
        .eq('selected_color', defaultColor)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existing.quantity + 1 
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new cart item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
            selected_size: defaultSize,
            selected_color: defaultColor
          }]);

        if (insertError) throw insertError;
      }

      // ✅ REMOVE from favorites after adding to cart
      const { error: deleteError } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistItem.id);

      if (deleteError) throw deleteError;

      alert('Moved to cart successfully!');
      loadWishlist(); // Refresh the list
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart: ' + error.message);
    }
  };

  // ✅ UPDATED: Add all to cart AND remove from favorites
  const addAllToCart = async () => {
    if (selectedItems.length === 0) return;

    try {
      const selectedWishlistItems = wishlistItems.filter(item => 
        selectedItems.includes(item.id) && item.products?.stock > 0
      );

      for (const item of selectedWishlistItems) {
        await addToCart(item);
      }

      alert('All items moved to cart!');
      setSelectedItems([]);
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error processing items');
    }
  };

  const totalSelectedInStock = selectedItems.filter(id => {
    const item = wishlistItems.find(w => w.id === id);
    return item?.products?.stock > 0;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/marketplace')}
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

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">My Favorites</h2>
          <span className="text-gray-600">{wishlistItems.length} items</span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-600 text-lg mb-4">Your favorites list is empty</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white border border-gray-300 rounded-lg shadow-md">
              <table className="w-full">
                <thead className="border-b border-gray-300">
                  <tr className="text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    <th className="py-4 px-6 w-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === wishlistItems.filter(i => i.products?.stock > 0).length && wishlistItems.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-black rounded"
                      />
                    </th>
                    <th className="py-4 px-6 w-1/2">PRODUCTS</th>
                    <th className="py-4 px-6">PRICE</th>
                    <th className="py-4 px-6">STOCK</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistItems.map((item) => {
                    const product = item.products;
                    const inStock = product?.stock > 0;

                    return (
                      <tr key={item.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            disabled={!inStock}
                            className={`w-4 h-4 rounded ${inStock ? 'accent-black' : 'text-gray-400'}`}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              <img 
                                src={product?.image || '/logos/placeholder.png'} 
                                alt={product?.name} 
                                className="w-full h-full object-contain p-1" 
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{product?.name}</p>
                              <p className="text-sm text-gray-500">{product?.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          ₱{parseFloat(product?.price || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block text-xs font-bold ${
                            inStock ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {inStock ? `IN STOCK (${product.stock})` : 'OUT OF STOCK'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => addToCart(item)}
                            disabled={!inStock}
                            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                              inStock
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            ADD TO CART
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="px-3 py-2 text-sm rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {wishlistItems.map((item) => {
                const product = item.products;
                const inStock = product?.stock > 0;

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-300 p-4">
                    <div className="flex items-start space-x-4">
                      <div className="pt-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          disabled={!inStock}
                          className={`w-4 h-4 rounded ${inStock ? 'accent-black' : 'text-gray-400'}`}
                        />
                      </div>
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={product?.image || '/logos/placeholder.png'} 
                          alt={product?.name} 
                          className="w-full h-full object-contain p-1" 
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-900 text-base">{product?.name}</p>
                        <p className="text-sm text-gray-500 mb-1">{product?.brand}</p>
                        <p className="font-bold text-lg text-black">₱{parseFloat(product?.price || 0).toLocaleString()}</p>
                        <span className={`inline-block text-xs font-bold mt-1 ${
                          inStock ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!inStock}
                        className={`flex-1 py-3 text-sm rounded-lg font-medium transition-colors ${
                          inStock
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        ADD TO CART
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="px-4 py-3 text-sm rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center space-y-4 sm:space-y-0 space-y-reverse">
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === wishlistItems.filter(i => i.products?.stock > 0).length && wishlistItems.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-black rounded mr-2"
                  />
                  Select All
                </label>
                <button
                  onClick={deleteSelected}
                  disabled={selectedItems.length === 0}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedItems.length > 0
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Remove ({selectedItems.length})
                </button>
              </div>
              
              <button
                onClick={addAllToCart}
                disabled={selectedItems.length === 0 || totalSelectedInStock === 0}
                className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-colors ${
                  selectedItems.length > 0 && totalSelectedInStock > 0
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                ADD ALL TO CART ({totalSelectedInStock})
              </button>
            </div>
          </>
        )}
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

export default Favorites;
