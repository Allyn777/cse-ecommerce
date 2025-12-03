import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PaymentSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId && user) {
      handlePaymentSuccess();
    }
  }, [orderId, user]);

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get payment intent details from URL params
      const paymentIntent = searchParams.get('payment_intent');
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

      console.log('🔵 Processing payment success for order:', orderId);
      console.log('🔵 Stripe payment intent:', paymentIntent);

      // 1. Check if order exists and belongs to user
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(id, stock)
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (checkError) {
        console.error('❌ Order check error:', checkError);
        throw new Error(checkError.code === 'PGRST116' 
          ? 'Order not found. It may have been deleted or you do not have permission.'
          : `Failed to verify order: ${checkError.message}`
        );
      }

      if (!existingOrder) {
        throw new Error('Order does not exist.');
      }

      // Check if already processed
      if (existingOrder.payment_status === 'paid') {
        console.log('✅ Order already processed, showing success page');
        setOrder(existingOrder);
        setLoading(false);
        return;
      }

      console.log('🔵 Order found, processing payment...');

      // 2. Update order status to PAID
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: paymentIntent || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Order update error:', updateError);
        throw new Error(`Failed to update order: ${updateError.message}`);
      }

      console.log('✅ Order status updated to PAID');

      // 3. CREATE PAYMENT TRANSACTION RECORD
      if (paymentIntent) {
        const { error: transactionError } = await supabase
          .from('payment_transactions')
          .insert({
            order_id: orderId,
            transaction_id: paymentIntent,
            payment_method: 'stripe',
            amount: existingOrder.total_amount,
            currency: existingOrder.currency || 'PHP',
            status: 'succeeded',
            stripe_payment_intent_id: paymentIntent,
            stripe_charge_id: paymentIntent, // Can be updated with actual charge ID if available
            gateway_response: {
              payment_intent: paymentIntent,
              processed_at: new Date().toISOString()
            }
          });

        if (transactionError) {
          console.error('⚠️ Transaction record error (non-critical):', transactionError);
          // Don't fail the whole process if this fails
        } else {
          console.log('✅ Payment transaction recorded');
        }
      }

      // 4. DEDUCT STOCK FOR EACH PRODUCT
      if (existingOrder.order_items && existingOrder.order_items.length > 0) {
        console.log('🔵 Deducting stock for', existingOrder.order_items.length, 'items...');

        for (const item of existingOrder.order_items) {
          try {
            const product = item.products;
            if (!product) {
              console.warn('⚠️ Product not found for item:', item.product_id);
              continue;
            }

            const newStock = product.stock - item.quantity;
            
            console.log(`🔵 Product ${item.product_name}: ${product.stock} → ${newStock}`);

            // Update product stock
            const { error: stockError } = await supabase
              .from('products')
              .update({ 
                stock: Math.max(0, newStock), // Never go below 0
                status: newStock <= 0 ? 'out_of_stock' : 'active' // Auto-update status
              })
              .eq('id', item.product_id);

            if (stockError) {
              console.error('⚠️ Stock update error for product:', item.product_id, stockError);
              // Continue with other items even if one fails
            } else {
              console.log(`✅ Stock updated for ${item.product_name}`);
            }
          } catch (stockErr) {
            console.error('⚠️ Error processing stock for item:', item, stockErr);
            // Continue with other items
          }
        }

        console.log('✅ Stock deduction completed');
      }

      // 5. Clear user's cart
      try {
        const { error: cartError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (cartError) {
          console.warn('⚠️ Cart clearing failed (non-critical):', cartError);
        } else {
          console.log('✅ Cart cleared');
        }
      } catch (cartErr) {
        console.warn('⚠️ Cart error:', cartErr);
      }

      // 6. Fetch updated order
      const { data: updatedOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('❌ Fetch updated order error:', fetchError);
        throw new Error(`Failed to load updated order: ${fetchError.message}`);
      }

      setOrder(updatedOrder);
      console.log('✅✅✅ Payment processing completed successfully!');
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Error in payment success:', err);
      setError(err.message || 'Failed to confirm payment');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Processing order and updating inventory</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmation Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Your payment was successful with Stripe, but we encountered an issue updating your order.
            Please contact support with your order number.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/profilepage')}
              className="w-full bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              GO TO MY ORDERS
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              BACK TO SHOPPING
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white py-4 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">Fighting Gears</h1>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <img src="/logos/boxing.png" alt="Logo" className="w-6 h-6" />
            </div>
          </div>
        </div>
      </header>

      {/* Success Content */}
      <main className="max-w-2xl mx-auto p-4 sm:p-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for your purchase! Your order has been confirmed.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order Number</span>
                <span className="font-semibold text-gray-900">{order?.order_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-semibold text-gray-900">₱{order?.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="font-semibold text-gray-900">Credit/Debit Card</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  ✓ Paid & Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-bold text-blue-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>We'll send you an email confirmation shortly</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your order will be processed within 1-2 business days</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Track your order status in your profile</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Estimated delivery: 3-5 business days</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/profilepage')}
              className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              VIEW MY ORDERS
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex-1 bg-white text-black border-2 border-black py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">Need help with your order?</p>
          <a 
            href="mailto:support@fightinggears.com" 
            className="text-black font-semibold hover:underline text-sm"
          >
            Contact Support
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm">© 2025 Fighting Gears. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PaymentSuccessPage;