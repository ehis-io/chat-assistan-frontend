"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MetaCallback() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Simulate a brief loading state before showing the "Consent" screen
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleGrantPermissions = async () => {
        setLoading(true);
        // Simulate sending token to backend
        setTimeout(() => {
            router.push("/onboarding?meta_connected=true");
        }, 1500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Connecting to Meta...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
            <div className="max-w-[500px] w-full bg-white rounded-lg shadow-2xl overflow-hidden animate-fadeInSlow">
                {/* Meta Header */}
                <div className="bg-[#1877F2] px-6 py-4 flex items-center gap-3">
                    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-white font-bold text-xl uppercase tracking-tighter">Meta Login</span>
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-[var(--primary-color)] to-[var(--accent-color)] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            CA
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">WhatsApp Chat Assist</h2>
                            <p className="text-sm text-gray-500">wants to use your Meta account</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-6 font-medium border-b pb-4">
                        WhatsApp Chat Assist will receive your name and profile picture, and requires the following permissions:
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800">whatsapp_business_management</span>
                                <span className="text-xs text-gray-500 leading-relaxed">Required to create and manage your message templates and WhatsApp Business assets.</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800">whatsapp_business_messaging</span>
                                <span className="text-xs text-gray-500 leading-relaxed">Required to send messages and notifications to your customers.</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleGrantPermissions}
                            className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white py-3 rounded-lg font-bold transition-colors shadow-md"
                        >
                            Continue as User
                        </button>
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            This does not let WhatsApp Chat Assist post to Facebook without your permission.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
