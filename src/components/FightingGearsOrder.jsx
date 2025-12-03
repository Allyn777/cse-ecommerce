import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// --- Icon Definitions ---
const Icon = ({ path, className = "w-5 h-5", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const LocationIcon = (props) => <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM12 13a3 3 0 100-6 3 3 0 000 6z" {...props} />;
const TruckIcon = (props) => <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414l-1.414 1.414M15 12h2.5L16 11l-2-3-4 5h-1" {...props} />;
const TagIcon = (props) => <Icon path="M7 7h.01M7 3h.01M3 7h.01M3 3h.01M17 3h.01M21 7h.01M21 3h.01M17 21h.01M21 17h.01M14 21h.01M10 21h.01M3 17h.01M7 21h.01M21 13h.01M3 13h.01M21 10h.01M3 10h.01M7 17h.01M17 7h.01M10 3h.01M14 3h.01" {...props} />;
const EditIcon = (props) => <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z" {...props} />;
const ArrowLeftIcon = (props) => <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" {...props} />;

// --- Product Item Component ---
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

// --- Stripe Payment Form Component ---
const StripePaymentForm = ({ onPaymentSuccess, amount, disabled }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    // Pass payment method to parent component
    onPaymentSuccess(paymentMethod);
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </form>
  );
};

// --- Main Checkout Component ---
const FightingGearsOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'stripe'
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

  // Fetch cart items and user profile
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

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const shippingFee = 150;
  const subtotal = calculateSubtotal();
  const totalAmount = subtotal + shippingFee;

  // Generate order number
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `FG-${year}-${random}`;
  };

  // Handle place order
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
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
          customer_notes: customerNotes
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

      // If COD, mark as confirmed
      if (paymentMethod === 'cod') {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', order.id);

        if (updateError) throw updateError;

        // Clear cart
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        alert('Order placed successfully! You will receive your order via Cash on Delivery.');
        navigate('/profile');
      } else {
        // Stripe payment - redirect to payment processing
        navigate(`/payment/${order.id}`);
      }

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
            <h1 className="text-lg font-semibold truncate">Welcome to Fighting Gears</h1>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <img src="/logos/boxing.png" alt="Gloves" className="w-6 h-6" />
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/wishlists')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-grow">    
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6">Checkout</h2>

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
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="Street Address"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Province"
                  value={shippingAddress.province}
                  onChange={(e) => setShippingAddress({...shippingAddress, province: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
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
                  Message for seller:
                </label>
                <input
                  id="seller-message"
                  type="text"
                  placeholder="Optional: Leave a message for the seller"
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

            {/* Payment Method */}
            <section className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-black"
                  />
                  <div className="ml-3 flex-1">
                    <span className="font-semibold text-sm text-gray-900">CASH ON DELIVERY</span>
                    <p className="text-xs text-gray-500 mt-1">Pay when you receive your order</p>
                  </div>
                </label>

                {/* Stripe Card Payment */}
                <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'stripe' ? 'border-black bg-gray-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-black mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-gray-900">CREDIT/DEBIT CARD</span>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-4" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Secure payment via Stripe</p>
                    
                    {paymentMethod === 'stripe' && (
                      <div className="mt-3">
                        <Elements stripe={stripePromise}>
                          <StripePaymentForm 
                            amount={totalAmount}
                            onPaymentSuccess={(pm) => console.log('Payment method:', pm)}
                            disabled={processing}
                          />
                        </Elements>
                      </div>
                    )}
                  </div>
                </label>
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
            
            <div className="pt-6 flex justify-end">
              <button 
                onClick={handlePlaceOrder}
                disabled={processing || cartItems.length === 0}
                className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-black text-white py-3 px-6 rounded-lg font-bold text-base transition-colors duration-200 shadow-lg ${
                  processing || cartItems.length === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-800'
                }`}
              >
                {processing ? 'PROCESSING...' : 'PLACE ORDER'}
              </button>
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