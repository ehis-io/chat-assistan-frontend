"use client";

import { useEffect, useState } from "react";
import { loadMetaSdk, launchEmbeddedSignup } from "@/lib/utils/metaSdk";

interface MetaEmbeddedSignupProps {
    onSuccess: (data: { code: string; waba_id: string; phone_number_id: string }) => void;
    onError: (error: string) => void;
}

export default function MetaEmbeddedSignup({ onSuccess, onError }: MetaEmbeddedSignupProps) {
    const [isLoading, setIsLoading] = useState(false);
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || "1234567890"; // Fallback for dev

    useEffect(() => {
        // Listen for the message from the Meta popup
        const handleMessage = (event: MessageEvent) => {
            // Check origin for security
            if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
                return;
            }

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                if (data.type === 'WA_EMBEDDED_SIGNUP_SUCCESS') {
                    console.log("Meta Signup Success Data:", data);
                    // Standard Meta structure: data.data contains { code, waba_id, phone_number_id }
                    if (data.data) {
                        onSuccess({
                            code: data.data.code,
                            waba_id: data.data.waba_id,
                            phone_number_id: data.data.phone_number_id
                        });
                    }
                } else if (data.type === 'WA_EMBEDDED_SIGNUP_ERROR') {
                    onError(data.error_message || "Meta Signup failed.");
                }
            } catch (err) {
                // Not a JSON message or unrelated
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onSuccess, onError]);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            await loadMetaSdk(appId);
            await launchEmbeddedSignup();
        } catch (err: any) {
            onError(err.message || "Failed to launch Meta Signup.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-[#1877F2] text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 disabled:opacity-70"
        >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {isLoading ? "Loading Meta..." : "Connect WhatsApp Account"}
        </button>
    );
}
