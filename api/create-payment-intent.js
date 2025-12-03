import Stripe from 'stripe';

export const config = {
  runtime: 'nodejs20.x',
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse body manually — required on Vercel
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    let { amount, orderId, currency = 'usd' } = body;

    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Missing amount or orderId' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency, // USD only — PHP is unsupported
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("Stripe Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
