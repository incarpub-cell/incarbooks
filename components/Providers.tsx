'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function Providers({ children }: { children: React.ReactNode }) {
  const initialOptions = {
    clientId: (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test").replace(/[\r\n"']/g, '').trim(),
    currency: "USD",
    intent: "capture",
    locale: "en_US",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
