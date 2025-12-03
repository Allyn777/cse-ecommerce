// FightingGearsOrder.jsx - SIMPLIFIED VERSION

import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// --- Icon Definitions (keep these) ---
const Icon = ({ path, className = "w-5 h-5", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const LocationIcon = (props) => <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM12 13a3 3 0 100-6 3 3 0 000 6z" {...props} />;
const TruckIcon = (props) => <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414l-1.414 1.414M15 12h2.5L16 11l-2-3-4 5h-1" {...props} />;
const ArrowLeftIcon = (props) => <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" {...props} />;

// --- Product Item Component (keep this) ---
const ProductItem = ({ item }) => (
  <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center text-sm border-t border-gray-200 pt-3 mt-3">
    <div className="col-span-8 sm:col-span-6 flex items-center space-x-3">
      <div className="w-14 h-14 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{item.product.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {item.selected_size && `Size: ${item.selected_size}`}
          {item.selected_size && item.selected_color && ' | '}
          {item.selected_color && `Color: ${item.selected_color}`}
        </p>
        <div className="flex space-x-2 text-xs text-gray-600 mt-1 sm:hidden">
          <span>₱{item.product.price.toLocaleString()}</span>
          <span>x {item.quantity}</span>
        </div>
      </div>
    </div>
    
    <div className="col-span-2 text-center hidden sm:block">
      <p className="text-gray-900">₱{item.product.price.toLocaleString()}</p>
    </div>
    
    <div className="col-span-2 text-center hidden sm:block">
      <p className="text-gray-900">{item.quantity}</p>
    </div>

    <div className="col-span-4 sm:col-span-2 text-right">
      <p className="sm:hidden text-xs text-gray-500 mb-1">Subtotal</p>
      <p className="font-semibold text-black text-sm sm:text-base">
        ₱{(item.product.price * item.quantity).toLocaleString()}
      </p>
    </div>
  </div>
);

// --- Main Checkout Component ---
const FightingGearsOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zip: ''
  });
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchCartItems();
      fetchUserProfile();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      alert('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setUserProfile(data);
        setShippingAddress({
          name: data.full_name || '',
          phone: data.phone || '',
          address: '',
          city: '',
          province: '',
          zip: ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const shippingFee = 150;
  const subtotal = calculateSubtotal();
  const totalAmount = subtotal + shippingFee;

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `FG-${year}-${random}`;
  };

  // Handle place order - ONLY Stripe now
  const handlePlaceOrder = async () => {
    // Validation
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      alert('Please fill in all shipping address fields');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setProcessing(true);

    try {
      // Create order
      const orderNumber = generateOrderNumber();
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          subtotal: subtotal,
          shipping_amount: shippingFee,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'stripe', // Always stripe
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          customer_notes: customerNotes,
          currency: 'PHP'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image,
        product_sku: item.product.sku,
        selected_size: item.selected_size,
        selected_color: item.selected_color,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Redirect to payment page
      console.log('Order created, redirecting to payment:', order.id);
      navigate(`/payment/${order.id}`);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-black text-white py-4 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/cart')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold truncate">Checkout</h1>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <img src="/logos/boxing.png" alt="Gloves" className="w-6 h-6" />
            </div>
          </div>
          
          <div className="w-6"></div> {/* Spacer for balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-grow">    
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6">Complete Your Order</h2>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          
          {/* 1. Delivery Address */}
          <section className="p-4 sm:p-6 border-b-4 border-dashed border-red-300">
            <div className="flex items-center space-x-2 text-red-600 mb-3">
              <LocationIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Street Address"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md text-sm"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Province"
                  value={shippingAddress.province}
                  onChange={(e) => setShippingAddress({...shippingAddress, province: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </section>
          
          {/* 2. Products Ordered */}
          <div className="p-4 sm:p-6">
            <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 text-xs sm:text-sm text-gray-500 font-medium pb-2 border-b border-gray-100">
              <span className="col-span-6">PRODUCT</span>
              <span className="col-span-2 text-center">UNIT PRICE</span>
              <span className="col-span-2 text-center">QTY</span>
              <span className="col-span-2 text-right">ITEM SUBTOTAL</span>
            </div>

            <section className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 sm:hidden">Products Ordered</h2>
              {cartItems.map((item) => (
                <ProductItem key={item.id} item={item} />
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label htmlFor="seller-message" className="text-sm font-medium text-gray-600 block mb-2">
                  Message for seller: (Optional)
                </label>
                <input
                  id="seller-message"
                  type="text"
                  placeholder="Leave a message for the seller"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
                />
              </div>
            </section>
            
            {/* Shipping Block */}
            <section className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping</h2>
              <div className="flex items-center space-x-2 mb-4">
                <TruckIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">Shipping Option:</span>
                <span className="text-sm text-black font-semibold">Door to Door Delivery</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 border border-green-200 bg-green-50 p-3 rounded-lg">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-green-700 text-sm">Estimated delivery: 3-5 business days</span>
              </div>
            </section>

            {/* Payment Method - SIMPLIFIED */}
            <section className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-blue-300">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png" 
                      alt="Stripe" 
                      className="h-5"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Secure Card Payment</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      You will be redirected to a secure Stripe page to enter your card details.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>PCI compliant & 256-bit SSL encryption</span>
                </div>
              </div>
            </section>
          </div>

          {/* 3. Order Summary */}
          <section className="p-4 sm:p-6 bg-gray-100 rounded-b-lg border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Merchandise Subtotal</span>
                <span className="font-medium">₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="font-medium">₱{shippingFee.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-gray-300 pt-4">
              <span className="text-lg font-bold text-gray-900">Total Payment:</span>
              <span className="text-xl sm:text-2xl font-bold text-black">₱{totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="pt-6">
              <button 
                onClick={handlePlaceOrder}
                disabled={processing || cartItems.length === 0}
                className={`w-full bg-black text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200 shadow-lg flex items-center justify-center ${
                  processing || cartItems.length === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-800'
                }`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    PROCESSING...
                  </>
                ) : (
                  'PROCEED TO PAYMENT'
                )}
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-3">
                You will enter card details on the next page
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6 sm:py-8 px-4 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm md:text-base">© 2024 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FightingGearsOrder;