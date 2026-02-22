// client/src/components/StripeCheckout.jsx
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function StripeForm({ amount, onPaid, onFailed, onProcessingChange, onReady }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [creatingIntent, setCreatingIntent] = useState(false);

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL;
    
    if (!amount || amount <= 0) {
      console.warn("⚠️ Invalid amount for payment intent:", amount);
      setClientSecret("");
      return;
    }
    
    console.log("💰 Creating payment intent for amount:", amount);
    axios
      .post(`${api}/api/stripe/create-payment-intent`, { amount })
      .then((res) => {
        console.log("✅ Payment intent created:", res.data.clientSecret.substring(0, 20) + "...");
        setClientSecret(res.data.clientSecret);
      })
      .catch((err) => {
        console.error("❌ Failed to create payment intent:", err.response?.data || err.message);
        setClientSecret("");
      });
  }, [amount]);

  // Notify parent when clientSecret is received (Stripe element should be ready soon)
  useEffect(() => {
    if (clientSecret) {
      // small timeout to allow Elements to render
      setTimeout(() => {
        if (typeof onReady === "function") onReady();
      }, 100);
    }
  }, [clientSecret, onReady]);

  // When clientSecret and elements are ready, try to focus the CardElement to make it visible on small screens
  useEffect(() => {
    if (!clientSecret) return;
    if (!elements) return;
    const cardEl = elements.getElement(CardElement);
    if (cardEl && typeof cardEl.focus === 'function') {
      // small delay to ensure element is mounted
      setTimeout(() => {
        try {
          cardEl.focus();
        } catch {
          // ignore focus failures
        }
      }, 150);
    }
  }, [clientSecret, elements]);

  useEffect(() => {
    onProcessingChange?.(processing);
  }, [processing, onProcessingChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (processing || creatingIntent) {
      console.log('⚠️ Payment already processing, please wait...');
      return;
    }
    
    if (!stripe || !elements) {
      console.error('❌ Stripe not initialized');
      return;
    }
    
    setProcessing(true);

    let secret = clientSecret;
    try {
      if (!secret) {
        setCreatingIntent(true);
        const api = import.meta.env.VITE_API_URL;
        console.log('💳 Creating payment intent for amount:', amount);
        const res = await axios.post(`${api}/api/stripe/create-payment-intent`, { amount });
        secret = res?.data?.clientSecret || "";
        setClientSecret(secret);
        console.log('✅ Payment intent created');
      }
    } catch (err) {
      console.error("Failed to create payment intent on submit:", err.response?.data || err.message);
      setCreatingIntent(false);
      setProcessing(false);
      
      // Check for specific Stripe errors
      const errorData = err.response?.data;
      if (errorData?.code === 'STRIPE_KEY_INVALID' || errorData?.code === 'STRIPE_NOT_CONFIGURED') {
        alert('Payment processing is currently unavailable. Please contact support or try again later.');
      } else if (errorData?.message) {
        alert(`Payment error: ${errorData.message}`);
      } else {
        alert('Failed to initialize payment. Please try again or contact support.');
      }
      
      // Call onFailed callback if provided
      if (onFailed) {
        try {
          await onFailed(err);
        } catch (callbackError) {
          console.error('Error in onFailed callback:', callbackError);
        }
      }
      
      setTimeout(() => {
        window.location.href = "/order/failed";
      }, 500);
      return;
    } finally {
      setCreatingIntent(false);
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      console.error('❌ Card element not found');
      setProcessing(false);
      alert('Card form not ready. Please try again.');
      return;
    }
    
    console.log('💳 Confirming payment with Stripe...');
    const result = await stripe.confirmCardPayment(secret, { payment_method: { card } });
    setProcessing(false);

    const { error, paymentIntent } = result || {};

    if (error) {
      console.error("Stripe payment failed:", error);
      try {
        const maybePromise = onFailed?.(error);
        if (maybePromise && typeof maybePromise.then === 'function') {
          await maybePromise;
        }
      } catch (e) {
        console.error('Error in onFailed handler:', e);
      }
      window.location.href = "/order/failed";
      return;
    }

    if (paymentIntent) {
      console.log('✅ Payment Intent received:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount
      });
      
      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded, calling onPaid handler...');
        try {
          const maybePromise = onPaid?.(paymentIntent);
          if (maybePromise && typeof maybePromise.then === 'function') {
            await maybePromise;
            console.log('✅ onPaid handler completed');
          } else if (onPaid) {
            // If it's not a promise, just call it
            onPaid(paymentIntent);
          }
          
          // FALLBACK: If redirect didn't happen after 3 seconds, force it
          setTimeout(() => {
            if (window.location.pathname !== '/order/success' && window.location.pathname !== '/order/failed') {
              console.warn('⚠️ onPaid handler did not redirect, forcing redirect to success...');
              window.location.href = "/order/success";
            }
          }, 3000);
        } catch (e) {
          console.error('❌ Error in onPaid handler:', e);
          // Even if handler fails, payment succeeded - redirect to success
          console.log('⚠️ onPaid handler failed, but payment succeeded. Redirecting to success page...');
          setTimeout(() => {
            window.location.href = "/order/success";
          }, 500);
        }
        // onPaid handler will redirect to success when it finishes
        return;
      }

      // Any other status treat as failure (e.g., requires_action not completed)
      console.warn('PaymentIntent not succeeded:', paymentIntent.status);
      const pseudoError = { message: 'Payment not completed', payment_intent: paymentIntent };
      try {
        const maybePromise = onFailed?.(pseudoError);
        if (maybePromise && typeof maybePromise.then === 'function') {
          await maybePromise;
        }
      } catch (e) {
        console.error('Error in onFailed handler:', e);
      }
      window.location.href = "/order/failed";
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full">
      <CardElement className="p-3 border rounded" />
      <button
        type="submit"
        disabled={!stripe || processing || !amount || amount <= 0}
        className="btn-org btn-lg w-full"
      >
        {processing || creatingIntent ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
}

export default function StripeCheckout({ amount, onPaid, onFailed, onProcessingChange, onReady }) {
  // Quick debug: fetch server Stripe account info and compare key prefixes
  useEffect(() => {
    const publishable = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
    const pubPrefix = publishable.substring(0, 6);
    console.log('[Stripe Debug] Publishable key prefix:', pubPrefix, '| masked:', publishable ? publishable.replace(/.(?=.{4})/g, '*') : '(none)');

    const api = import.meta.env.VITE_API_URL;
    if (!api) return;
    (async () => {
      try {
        const res = await axios.get(`${api}/api/stripe/account-info`);
        console.log('[Stripe Debug] Server account info:', res.data.account || res.data);
        console.log('[Stripe Debug] Server key prefix:', res.data.keyPrefix);
        if (res.data.keyPrefix && pubPrefix && res.data.keyPrefix !== pubPrefix) {
          console.warn('[Stripe Debug] KEY MISMATCH: client publishable key prefix does not match server secret key prefix. Ensure both keys come from the same Stripe account and same mode (test/live).');
        }
      } catch (err) {
        console.warn('[Stripe Debug] Failed to fetch server Stripe account info:', err.response?.data || err.message);
      }
    })();
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <StripeForm
        amount={amount}
        onPaid={onPaid}
        onFailed={onFailed}
        onProcessingChange={onProcessingChange}
        onReady={onReady}
      />
    </Elements>
  );
}
