"use client";

import { useEffect, useState } from "react";

interface PaystackProps {
    email: string;
    amount: number; // in Naira (will be converted to Kobo)
    metadata?: any;
    onSuccess: (reference: any) => void;
    onClose: () => void;
    label?: string;
    planCode?: string; // Optional plan code for subscriptions
}

declare global {
    interface Window {
        PaystackPop: any;
    }
}

export default function PaystackInline({ email, amount, metadata, onSuccess, onClose, label = "Pay Now", planCode }: PaystackProps) {
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = () => {
        if (!scriptLoaded) {
            alert("Payment system is still loading. Please try again in a moment.");
            return;
        }

        const config: any = {
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx",
            email: email,
            amount: amount * 100, // Amount is in Kobo
            currency: "NGN",
            ref: '' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
                ...metadata,
                subscription: planCode ? true : false,
            },
            callback: function (response: any) {
                onSuccess(response);
            },
            onClose: function () {
                onClose();
            }
        };

        // Add plan code if provided (for subscriptions)
        if (planCode) {
            config.plan = planCode;
        }

        const handler = window.PaystackPop.setup(config);
        handler.openIframe();
    };

    return (
        <button
            onClick={handlePayment}
            className="w-full py-4 rounded-2xl bg-[var(--primary-color)] text-white font-bold shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:bg-[var(--accent-color)] transition-all duration-300 transform active:scale-95"
        >
            {label}
        </button>
    );
}
