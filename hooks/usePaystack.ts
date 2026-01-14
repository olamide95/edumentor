import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const usePaystackPayment = () => {
  useEffect(() => {
    // Load Paystack script if not already loaded
    if (typeof window !== 'undefined' && !window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('Paystack script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
      };
      document.body.appendChild(script);
    }
  }, []);

  const initializePayment = (config: any) => {
    if (typeof window !== 'undefined' && window.PaystackPop) {
      try {
        // Get Paystack public key from environment variables
        const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        
        if (!paystackPublicKey) {
          console.error('Paystack public key not found in environment variables');
          toast.error('Payment configuration error. Please contact support.');
          return;
        }

        // Create callback function that Paystack expects
        const paystackCallback = (response: any) => {
          console.log('Paystack callback response:', response);
          if (typeof config.callback === 'function') {
            config.callback(response);
          }
        };

        // Create onClose function that Paystack expects
        const paystackOnClose = () => {
          console.log('Payment window closed');
          if (typeof config.onClose === 'function') {
            config.onClose();
          }
        };

        const handler = window.PaystackPop.setup({
          key: paystackPublicKey,
          email: config.email,
          amount: config.amount,
          ref: config.reference,
          metadata: config.metadata || {},
          callback: paystackCallback,
          onClose: paystackOnClose,
          currency: 'NGN',
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        });
        
        handler.openIframe();
      } catch (error: any) {
        console.error('Error initializing Paystack payment:', error);
        toast.error(`Payment error: ${error.message}`);
      }
    } else {
      console.error('Paystack script not loaded');
      
      // Fallback for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating payment success');
        setTimeout(() => {
          if (typeof config.callback === 'function') {
            config.callback({
              reference: config.reference || `dev-${Date.now()}`,
              transaction: `dev-transaction-${Date.now()}`,
              status: 'success',
              message: 'Payment successful (development mode)',
              trxref: config.reference,
            });
          }
        }, 1000);
      } else {
        toast.error('Payment system not available. Please try again later.');
      }
    }
  };

  return { initializePayment };
};