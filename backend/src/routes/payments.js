import express from 'express';
import Stripe from 'stripe';
import { authenticate, requireSubscription } from '../middleware/auth.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Get available credit packages
router.get('/packages', async (req, res) => {
  try {
    const packages = [
      {
        id: '5',
        name: 'Quick Start Pack',
        credits: 5,
        price: 0.99,
        pricePerCredit: 0.20,
        description: 'Perfect for trying out the platform'
      },
      {
        id: '20',
        name: 'Popular Choice',
        credits: 20,
        price: 2.99,
        pricePerCredit: 0.15,
        description: 'Best value for regular users',
        popular: true
      },
      {
        id: '50',
        name: 'Power User Pack',
        credits: 50,
        price: 6.99,
        pricePerCredit: 0.14,
        description: 'For serious bot trainers'
      },
      {
        id: '100',
        name: 'Bot Master Pack',
        credits: 100,
        price: 12.99,
        pricePerCredit: 0.13,
        description: 'Maximum value with bonus credits',
        bonus: 10
      }
    ];

    res.json({
      success: true,
      data: { packages }
    });

  } catch (error) {
    logger.error('Get credit packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create payment intent for credits
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { packageId } = req.body;

    const packages = {
      '5': { credits: 5, price: 0.99 },
      '20': { credits: 20, price: 2.99 },
      '50': { credits: 50, price: 6.99 },
      '100': { credits: 100, price: 12.99 }
    };

    const selectedPackage = packages[packageId];
    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package selected'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(selectedPackage.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.userId.toString(),
        packageId,
        credits: selectedPackage.credits
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        package: selectedPackage
      }
    });

  } catch (error) {
    logger.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Handle successful payment
router.post('/payment-success', authenticate, async (req, res) => {
  try {
    const { paymentIntentId, packageId } = req.body;

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Get package details
    const packages = {
      '5': { credits: 5 },
      '20': { credits: 20 },
      '50': { credits: 50 },
      '100': { credits: 100 }
    };

    const selectedPackage = packages[packageId];
    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package'
      });
    }

    // Add credits to user
    const user = await User.findById(req.userId);
    user.credits += selectedPackage.credits;
    await user.save();

    logger.info(`Credits purchased: ${selectedPackage.credits} credits for user ${user.username}`);

    res.json({
      success: true,
      message: 'Credits added successfully',
      data: {
        creditsAdded: selectedPackage.credits,
        totalCredits: user.credits
      }
    });

  } catch (error) {
    logger.error('Payment success error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get subscription plans
router.get('/subscription-plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free Tier',
        price: 0,
        bots: 1,
        credits: 10,
        features: [
          '1 bot maximum',
          '10 credits per month',
          'Basic avatar options',
          'Standard feed access'
        ]
      },
      {
        id: 'pro',
        name: 'Pro Tier',
        price: 4.99,
        bots: 2,
        credits: 50,
        features: [
          '2 bots maximum',
          '50 credits per month',
          'Premium avatar packs',
          'Advanced analytics',
          'Priority support',
          'Early access to features'
        ],
        popular: true
      },
      {
        id: 'premium',
        name: 'Premium Tier',
        price: 9.99,
        bots: 5,
        credits: 100,
        features: [
          '5 bots maximum',
          '100 credits per month',
          'All avatar packs',
          'Full analytics suite',
          'Priority support',
          'Early access to features',
          'Advanced bot customization'
        ]
      }
    ];

    res.json({
      success: true,
      data: { plans }
    });

  } catch (error) {
    logger.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create subscription
router.post('/create-subscription', authenticate, async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;

    const plans = {
      'pro': { price: 4.99, bots: 2, credits: 50 },
      'premium': { price: 9.99, bots: 5, credits: 100 }
    };

    const selectedPlan = plans[planId];
    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    const user = await User.findById(req.userId);

    // Create Stripe customer if doesn't exist
    let customerId = user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Tier`,
          },
          unit_amount: Math.round(selectedPlan.price * 100),
          recurring: {
            interval: 'month',
          },
        },
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      }
    });

  } catch (error) {
    logger.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    user.subscription.status = 'cancelled';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      case 'customer.subscription.created':
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdated(updatedSubscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handlePaymentSuccess(paymentIntent) {
  const { userId, packageId, credits } = paymentIntent.metadata;
  
  if (userId && credits) {
    const user = await User.findById(userId);
    if (user) {
      user.credits += parseInt(credits);
      await user.save();
      logger.info(`Credits added via webhook: ${credits} for user ${userId}`);
    }
  }
}

async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  
  if (user) {
    user.subscription.stripeSubscriptionId = subscription.id;
    user.subscription.status = 'active';
    user.subscription.endDate = new Date(subscription.current_period_end * 1000);
    await user.save();
    logger.info(`Subscription created for user: ${user.username}`);
  }
}

async function handleSubscriptionUpdated(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  
  if (user) {
    user.subscription.status = subscription.status;
    user.subscription.endDate = new Date(subscription.current_period_end * 1000);
    await user.save();
    logger.info(`Subscription updated for user: ${user.username}`);
  }
}

async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  
  if (user) {
    user.subscription.status = 'cancelled';
    user.subscription.type = 'free';
    await user.save();
    logger.info(`Subscription cancelled for user: ${user.username}`);
  }
}

export default router;
