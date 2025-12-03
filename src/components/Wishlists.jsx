import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Wishlists = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadCart = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) throw error;
      loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.filter(item => item.products?.stock > 0).length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        cartItems
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

    if (!confirm(`Remove ${selectedItems.length} item(s) from cart?`)) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .in('id', selectedItems);

      if (error) throw error;

      setSelectedItems([]);
      loadCart();
      alert('Items removed from cart');
    } catch (error) {
      console.error('Error deleting cart items:', error);
      alert('Error removing items: ' + error.message);
    }
  };

  const deleteItem = async (cartItemId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      loadCart();
      alert('Item removed from cart');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error removing item: ' + error.message);
    }
  };

  const checkoutAll = async () => {
    if (selectedItems.length === 0) return;

    setProcessingCheckout(true);

    try {
      // Navigate to order page with selected items
      const selectedCartItems = cartItems.filter(item => 
        selectedItems.includes(item.id) && item.products?.stock > 0
      );

      // Here you can pass the selected items to the order page
      navigate('/fightinggearsorder', { state: { selectedItems: selectedCartItems } });
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error processing checkout');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        return total + (parseFloat(item.products?.price || 0) * item.quantity);
      }, 0);
  };

  const totalSelectedInStock = selectedItems.filter(id => {
    const item = cartItems.find(w => w.id === id);
    return item?.products?.stock > 0;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
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
            onClick={() => navigate('/favorites')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">Shopping Cart</h2>
          <span className="text-gray-600">{cartItems.length} items</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
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
                        checked={selectedItems.length === cartItems.filter(i => i.products?.stock > 0).length && cartItems.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-black rounded"
                      />
                    </th>
                    <th className="py-4 px-6 w-1/2">PRODUCTS</th>
                    <th className="py-4 px-6">PRICE</th>
                    <th className="py-4 px-6">QUANTITY</th>
                    <th className="py-4 px-6">TOTAL</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const product = item.products;
                    const inStock = product?.stock > 0;
                    const itemTotal = parseFloat(product?.price || 0) * item.quantity;

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
                              {item.selected_size && (
                                <p className="text-xs text-gray-500">Size: {item.selected_size}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          ₱{parseFloat(product?.price || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= product?.stock}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">
                          ₱{itemTotal.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
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
              {cartItems.map((item) => {
                const product = item.products;
                const inStock = product?.stock > 0;
                const itemTotal = parseFloat(product?.price || 0) * item.quantity;

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
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= product?.stock}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-bold text-lg">₱{itemTotal.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="w-full py-2 text-sm rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-300"
                      >
                        Remove from Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Subtotal ({totalSelectedInStock} items)</span>
                <span className="text-2xl font-bold">₱{calculateSubtotal().toLocaleString()}</span>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center space-y-4 sm:space-y-0 space-y-reverse">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer text-gray-700 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === cartItems.filter(i => i.products?.stock > 0).length && cartItems.length > 0}
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
                  onClick={checkoutAll}
                  disabled={selectedItems.length === 0 || totalSelectedInStock === 0 || processingCheckout}
                  className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-colors ${
                    selectedItems.length > 0 && totalSelectedInStock > 0 && !processingCheckout
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  {processingCheckout ? 'Processing...' : 'PROCEED TO CHECKOUT'}
                </button>
              </div>
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

export default Wishlists;