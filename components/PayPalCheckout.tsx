'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalCheckoutProps {
    amount: number;
    productTitle: string;
}

export default function PayPalCheckout({ amount, productTitle }: PayPalCheckoutProps) {
    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
        currency: "USD",
        intent: "capture",
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <div className="w-full relative z-0">
                <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", label: "pay" }}
                    createOrder={(data: any, actions: any) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    description: productTitle,
                                    amount: {
                                        currency_code: "USD",
                                        value: amount.toString(),
                                    },
                                },
                            ],
                        });
                    }}
                    onApprove={async (data: any, actions: any) => {
                        if (actions.order) {
                            const order = await actions.order.capture();
                            console.log("Order Successful:", order);
                            alert(`Transaction completed by ${order.payer?.name?.given_name || 'Buyer'}`);
                            // TODO: Save order to Firebase and redirect to download
                        }
                    }}
                />
            </div>
        </PayPalScriptProvider>
    );
}
