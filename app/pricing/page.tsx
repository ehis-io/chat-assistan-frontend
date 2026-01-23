"use client";

import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import Link from "next/link";
import PaystackInline from "../component/PaystackInline";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo, checkPaymentStatus, isAuthenticated, hasBusinessSetup } from "@/lib/utils/auth";

const pricingTiers = [
    {
        id: "free",
        name: "Free",
        price: "0",
        description: "Perfect for testing and small personal projects.",
        features: [
            "Up to 5 messages/month",
            "Basic AI assistance",
        ],
        buttonText: "Get Started",
        highlight: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "10000", // Using NGN for Paystack demo
        description: "Ideal for growing businesses needing more power.",
        features: [
            "Unlimited messages",
            "Advanced AI capabilities",
            "Priority email support",
            "Custom message templates",
            "Detailed analytics",
        ],
        buttonText: "Go Pro",
        highlight: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        description: "Scalable solutions for large organizations.",
        features: [
            "Dedicated AI training",
            "24/7 Phone & Zoom support",
            "Custom API integrations",
            "SLA guarantees",
            "Onboarding assistance",
        ],
        buttonText: "Contact Sales",
        highlight: false,
    },
];

export default function Pricing() {
    const router = useRouter();
    const [successPayment, setSuccessPayment] = useState(false);
    const [userEmail, setUserEmail] = useState("customer@example.com");
    const [hasValidPayment, setHasValidPayment] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(true);

    useEffect(() => {
        // Check if user is logged in and has business setup - redirect to dashboard
        if (isAuthenticated() && hasBusinessSetup()) {
            router.push("/dashboard");
            return;
        }

        const userInfo = getUserInfo();
        if (userInfo && userInfo.email) {
            setUserEmail(userInfo.email);
        }

        // Check payment status
        const fetchPaymentStatus = async () => {
            const result = await checkPaymentStatus();
            setHasValidPayment(result.hasValidPayment);
            setCheckingPayment(false);
        };

        fetchPaymentStatus();
    }, [router]);

    const handlePaymentSuccess = (reference: any) => {
        console.log("Payment successful", reference);
        setSuccessPayment(true);
        setTimeout(() => {
            router.push("/register?plan=pro&payment_ref=" + reference.reference);
        }, 2000);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[var(--background-color)] pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16 animate-fadeIn">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--text-color)] mb-6">
                            Simple, Transparent <span className="text-[var(--primary-color)]">Pricing</span>
                        </h1>
                        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
                            Choose the plan that's right for your business. Scale your customer engagement with AI-powered WhatsApp automation.
                        </p>
                    </div>

                    {successPayment && (
                        <div className="max-w-md mx-auto mb-10 p-6 bg-green-50 border border-green-200 rounded-3xl text-center animate-bounce">
                            <h3 className="text-green-800 font-bold text-xl mb-2">Payment Successful! 🎉</h3>
                            <p className="text-green-700 text-sm">Validating your subscription and redirecting to setup...</p>
                        </div>
                    )}

                    {hasValidPayment && (
                        <div className="max-w-md mx-auto mb-10 p-6 bg-blue-50 border border-blue-200 rounded-3xl text-center">
                            <h3 className="text-blue-800 font-bold text-xl mb-2">Active Subscription ✓</h3>
                            <p className="text-blue-700 text-sm">You already have an active Pro subscription. No need to purchase again!</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                        {pricingTiers.map((tier, index) => (
                            <div
                                key={tier.name}
                                className={`relative flex flex-col p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 ${tier.highlight
                                    ? "bg-white shadow-2xl border-2 border-[var(--primary-color)] z-10 scale-105"
                                    : "bg-white/50 backdrop-blur-sm border border-gray-100 shadow-xl"
                                    }`}
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                {tier.highlight && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--primary-color)] text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
                                        Most Popular
                                    </span>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-[var(--text-color)] mb-2">{tier.name}</h3>
                                    <p className="text-[var(--text-muted)] text-sm leading-relaxed">{tier.description}</p>
                                </div>

                                <div className="mb-8 flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-[var(--text-color)]">
                                        {tier.price === "Custom" ? "" : "₦"}
                                        {tier.price === "Custom" ? "Custom" : Number(tier.price).toLocaleString()}
                                    </span>
                                    {tier.price !== "Custom" && (
                                        <span className="text-[var(--text-muted)] font-medium">/month</span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-4 mb-10">
                                    {tier.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {tier.id === "pro" ? (
                                    hasValidPayment ? (
                                        <button
                                            disabled
                                            className="w-full py-4 rounded-2xl font-bold bg-gray-300 text-gray-500 cursor-not-allowed"
                                        >
                                            Active Subscription
                                        </button>
                                    ) : (
                                        <PaystackInline
                                            email={userEmail}
                                            amount={Number(tier.price)}
                                            label={tier.buttonText}
                                            planCode={process.env.NEXT_PUBLIC_PAYSTACK_PRO_PLAN_CODE}
                                            onSuccess={handlePaymentSuccess}
                                            onClose={() => console.log("Payment modal closed")}
                                        />
                                    )
                                ) : (
                                    <Link href={tier.name === "Enterprise" ? "mailto:sales@soro.com" : `/register?plan=${tier.id}`} className="block">
                                        <button className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 ${tier.highlight
                                            ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:bg-[var(--accent-color)]"
                                            : "bg-gray-50 text-[var(--text-color)] border border-gray-200 hover:bg-gray-100"
                                            }`}>
                                            {tier.buttonText}
                                        </button>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-[3rem] text-white text-center shadow-2xl animate-fadeInSlow">
                        <h2 className="text-3xl font-bold mb-4">Need something different?</h2>
                        <p className="text-blue-50 mb-8 max-w-xl mx-auto">
                            We offer custom plans tailored for specific industry needs. Talk to our consultants to find the best fit for your workflow.
                        </p>
                        <button className="bg-white text-[var(--primary-color)] px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all duration-300">
                            Book a Demo
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
