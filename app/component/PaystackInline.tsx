"use client";

import { useEffect, useState } from "react";

interface PaystackProps {
    email: string;
    amount: number; // in Naira (will be converted to Kobo)
    metadata?: any;
    onSuccess: (reference: any) => void;
    onClose: () => void;
    label?: string;
}

declare global {
    interface Window {
        PaystackPop: any;
    }
}

export default function PaystackInline({ email, amount, metadata, onSuccess, onClose, label = "Pay Now" }: PaystackProps) {
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

        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx", // Replace with your public key
            email: email,
            amount: amount * 100, // Amount is in Kobo
            currency: "NGN",
            ref: '' + Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference. Please replace with a reference you generated on your server
            metadata: metadata,
            callback: function (response: any) {
                // message: "Approved"
                // reference: "123456789"
                // status: "success"
                // trans: "123456789"
                // transaction: "123456789"
                onSuccess(response);
            },
            onClose: function () {
                onClose();
            }
        });

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
