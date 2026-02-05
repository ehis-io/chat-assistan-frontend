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

    const handlePayment = async () => {
        if (!scriptLoaded) {
            alert("Payment system is still loading. Please try again in a moment.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to proceed.");
            return;
        }

        try {
            // Initialize transaction on backend (SAVES PENDING TRANSACTION)
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const initResponse = await fetch(`${baseUrl}/payment/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    amount, // amount to be sent as is (likely in Naira if coming from Pricing, let backend handle conversion if needed or kept consistent)
                    metadata: {
                        ...metadata,
                        subscription: planCode ? true : false,
                        plan_code: planCode
                    }
                })
            });

            if (!initResponse.ok) {
                const errorData = await initResponse.json();
                alert(`Payment initialization failed: ${errorData.message || 'Unknown error'}`);
                return;
            }

            const initData = await initResponse.json();
            const { reference, access_code } = initData.data;

            const config: any = {
                key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx",
                email: email,
                amount: amount * 100, // Amount is in Kobo (frontend still expects kobo for display usually, but passing access_code might override)
                ref: reference, // USE BACKEND GENERATED REFERENCE
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

        } catch (error) {
            console.error("Payment error:", error);
            alert("An error occurred while initializing payment.");
        }
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
