// PaymentPage.jsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ order, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success/${order.id}`
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
      } else {
        // Payment successful but not redirected
        navigate(`/payment-success/${order.id}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
          <p className="text-gray-600 mt-2">Complete your order with card payment</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Order Total:</span>
            <span className="text-xl font-bold text-black">₱{order.total_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Order #:</span>
            <span className="font-medium">{order.order_number}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <PaymentElement 
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: order.shipping_address?.name || '',
                    phone: order.shipping_address?.phone || '',
                    address: {
                      line1: order.shipping_address?.address || '',
                      city: order.shipping_address?.city || '',
                      state: order.shipping_address?.province || '',
                      postal_code: order.shipping_address?.zip || ''
                    }
                  }
                }
              }}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!stripe || processing}
              className="w-full bg-black text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing Payment...
                </>
              ) : (
                `Pay ₱${order.total_amount.toLocaleString()}`
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Order
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderAndPaymentIntent();
    }
  }, [user, orderId]);

  const fetchOrderAndPaymentIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching order:', orderId, 'for user:', user.id);

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw new Error('Order not found. Please try again.');
      }

      if (!orderData) {
        throw new Error('Order does not exist.');
      }

      setOrder(orderData);
      console.log('Order found:', orderData);

      // Check if already paid
      if (orderData.payment_status === 'paid') {
        navigate(`/payment-success/${orderId}`);
        return;
      }

      // Create payment intent
      console.log('Creating payment intent for amount:', orderData.total_amount);
      
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: orderData.total_amount,
          orderId: orderData.id
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response:', errorText);
        throw new Error(`Payment setup failed: ${errorText.substring(0, 100)}`);
      }

      const responseData = await res.json();
      console.log('Payment intent created:', responseData);

      if (!responseData.clientSecret) {
        throw new Error('No payment token received');
      }

      setClientSecret(responseData.clientSecret);

    } catch (err) {
      console.error('Payment setup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up secure payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Setup Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchOrderAndPaymentIntent}
              className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Final step to confirm your order</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            {clientSecret && order && (
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#000000',
                    }
                  }
                }}
              >
                <PaymentForm order={order} clientSecret={clientSecret} />
              </Elements>
            )}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {order && (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₱{order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>₱{order.shipping_amount.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-lg">₱{order.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Shipping to:</h4>
                    <p className="text-sm text-gray-600">
                      {order.shipping_address?.name}<br />
                      {order.shipping_address?.address}<br />
                      {order.shipping_address?.city}, {order.shipping_address?.province}<br />
                      {order.shipping_address?.phone}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;