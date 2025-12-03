import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, orderId, currency = 'php' } = req.body;

    // Validate required fields
    if (!amount || !orderId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and orderId' 
      });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be a positive number.' 
      });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/centavos
      currency: currency.toLowerCase(),
      metadata: { 
        orderId: orderId,
        platform: 'Fighting Gears E-commerce'
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Order ${orderId} - Fighting Gears`,
    });

    // Return client secret to frontend
    return res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Stripe Error:', error);
    
    // Return user-friendly error message
    return res.status(400).json({ 
      error: error.message || 'Failed to create payment intent'
    });
  }
}

// Export config for Vercel
export const config = {
  api: {
    bodyParser: true,
  },
};