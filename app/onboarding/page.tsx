"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import dynamic from "next/dynamic";
import { updateBusinessInBackend, BusinessData } from "@/lib/utils/metaSdk";
import { getUserInfo } from "@/lib/utils/auth";

const MetaEmbeddedSignup = dynamic(() => import("../component/MetaEmbeddedSignup"), { ssr: false });

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [subStep, setSubStep] = useState(0);
    const [metaConnected, setMetaConnected] = useState(false);
    const [plan, setPlan] = useState<string | null>(null);
    const [paymentRef, setPaymentRef] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [businessData, setBusinessData] = useState<BusinessData>({
        name: "",
        type: "ECOMMERCE",
        description: "",
        whatYouOffer: "",
        contactInfo: "",
        availability: "",
        pricing: "",
        deliveryOptions: "",
        policies: "",
        commonQuestions: ""
    });

    const handleSaveBusiness = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await updateBusinessInBackend(businessData);
            setStep(3);
        } catch (err: any) {
            // console.error("Failed to save business data:", err);
            setError(err.message || "Failed to save business data. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const [whatsappConfig, setWhatsappConfig] = useState({
        wabaId: "",
        phoneNumberId: "",
        code: "",
        phoneNumber: "" // whatsappPhoneNumber
    });

    useEffect(() => {
        const p = searchParams.get("plan");
        const r = searchParams.get("ref");
        if (p) {
            setPlan(p);
            setPaymentRef(r);
            setStep(0); // Show partner welcome step
        }

        const info = getUserInfo();
        const biz = info?.business || info?.business_id;

        // If business exists AND status is CONNECTED, redirect to dashboard immediately
        const isConnected = biz && (biz.whatsapp_status === 'CONNECTED' || biz.status === 'CONNECTED');
        if (isConnected) {
            router.push("/dashboard");
            return;
        }

        // If business exists, populate state and skip to step 3 (if not already further)
        if (biz) {
            setBusinessData(prev => ({
                ...prev,
                name: biz.name || prev.name,
                type: biz.type || prev.type,
                description: biz.description || prev.description,
                // Populate other fields if they exist in the user object
                whatYouOffer: biz.knowledge_base?.whatYouOffer || prev.whatYouOffer,
                contactInfo: biz.knowledge_base?.contactInfo || prev.contactInfo,
                availability: biz.knowledge_base?.availability || prev.availability,
                pricing: biz.knowledge_base?.pricing || prev.pricing,
                deliveryOptions: biz.knowledge_base?.deliveryOptions || prev.deliveryOptions,
                policies: biz.knowledge_base?.policies || prev.policies,
                commonQuestions: biz.knowledge_base?.commonQuestions || prev.commonQuestions,
            }));

            // Only auto-advance if we're at the start and not already connected
            if (step < 3 && !searchParams.get("meta_connected")) {
                setStep(3);
                return;
            }
        } else if (step >= 2) {
            // If at the end but no business data, go back to step 1
            setStep(1);
            return;
        }

        // If at step 4 but WhatsApp status is not CONNECTED, go back to step 3
        if (step === 4 && biz?.whatsapp_status !== 'CONNECTED') {
            setStep(3);
            setError("Please link your WhatsApp account before finishing setup.");
            return;
        }

        if (searchParams.get("meta_connected") === "true") {
            setMetaConnected(true);
            setStep(2); // Jump to WhatsApp connection step
        }
    }, [searchParams, router]);

    const KNOWLEDGE_BASE_QUESTIONS = [
        {
            id: 'whatYouOffer',
            label: "What exactly do you offer?",
            guide: "Hi! I'm your AI guide. Let's start by defining what your business actually does. This helps me answer general inquiries about your services.",
            placeholder: "e.g., We provide fast-moving consumer goods and home delivery...",
            suggestions: ["Physical Retail Goods", "E-commerce Products", "Digital SaaS Tools", "Real Estate Services", "Consulting & Strategy", "Healthcare Services", "Educational Courses", "Hospitality & Dining", "Logistics & Delivery"]
        },
        {
            id: 'pricing',
            label: "How should I talk about pricing?",
            guide: "Pricing is the most common question. Should I give fixed rates, or tell people it depends on their requirements?",
            placeholder: "e.g., Starting from $20, or Custom quotes per project...",
            suggestions: ["Fixed pricing", "Subscription plans", "Custom quotes", "Starting from $...", "Tiered pricing", "Pay-as-you-go", "Free consultation", "Bulk discounts available"]
        },
        {
            id: 'contactInfo',
            label: "How can customers reach you directly?",
            guide: "If I can't answer a question, where should I point people? Your website, a phone number, or an email?",
            placeholder: "e.g., hello@business.com or call +123456789...",
            suggestions: ["Email: hello@example.com", "Call us at +...", "Visit our website", "Instagram DM", "Physical store visit", "Support helpdesk", "WhatsApp message"]
        },
        {
            id: 'availability',
            label: "What are your business hours?",
            guide: "When is your team available to take over if I can't help? People love knowing when you're 'open'.",
            placeholder: "e.g., 24/7 Service or Mon-Fri 9am-5pm...",
            suggestions: ["24/7 Support", "Mon-Fri 9am-6pm", "9am - 10pm daily", "By Appointment only", "Weekends closed", "Always open online", "Public holidays closed"]
        },
        {
            id: 'deliveryOptions',
            label: "How do you handle delivery?",
            guide: "If people order from you, how do they get it? Knowing your shipping radius or delivery method is key.",
            placeholder: "e.g., Nationwide shipping or Local pickup only...",
            suggestions: ["Nationwide shipping", "Local pickup point", "Same-day delivery", "3-5 business days", "Digital delivery (Email)", "International shipping", "Cloud access", "Home delivery"]
        },
        {
            id: 'policies',
            label: "Any important policies I should know?",
            guide: "To protect you and the customer, tell me about your refund or cancellation policies.",
            placeholder: "e.g., 30-day refund policy, no cancellations after 24h...",
            suggestions: ["30-day returns", "No refund policy", "Full money-back", "7-day exchange", "Terms & Conditions", "Privacy protection", "Cancel anytime", "Encrypted data"]
        },
        {
            id: 'commonQuestions',
            label: "Anything else you want me to know?",
            guide: "This is a catch-all for any other details that make your business unique. You can skip this if you're done!",
            placeholder: "e.g., We are family-owned since 1990...",
            suggestions: ["Family-owned since...", "Sustainable sourcing", "Award-winning", "Certified Organic", "Established in...", "100+ Happy Clients", "24/7 AI Assistance", "Global presence"]
        }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBusinessData(prev => ({ ...prev, [name]: value }));
    };

    const handleMetaSuccess = (data: { code: string; waba_id: string; phone_number_id: string }) => {
        setWhatsappConfig(prev => ({
            ...prev,
            wabaId: data.waba_id,
            phoneNumberId: data.phone_number_id,
            code: data.code
        }));
        setMetaConnected(true);
        setStep(4);
        setError(null);

        // Redirect to dashboard automatically after a short delay
        setTimeout(() => {
            router.push("/dashboard");
        }, 2000);
    };

    const handleMetaError = (err: string) => {
        setError(err);
    };

    const handleComplete = () => {
        const { getUserInfo } = require("@/lib/utils/auth");
        const info = getUserInfo();
        const biz = info?.business || info?.business_id;
        const isConnected = biz?.whatsapp_status === 'CONNECTED';

        if (!isConnected) {
            setError("WhatsApp connection is required to enter the dashboard.");
            setStep(3);
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-[var(--background-color)] pt-32 pb-20 px-6">
            <main className="max-w-2xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        {[0, 1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= s ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-color)]/30" : "bg-white text-gray-300 border border-gray-100"}`}>
                                    {s === 0 ? "★" : s}
                                </div>
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest ${step >= s ? "text-[var(--primary-color)]" : "text-gray-300"}`}>
                                    {s === 0 ? "Init" : s === 1 ? "Business" : s === 2 ? "Knowledge" : s === 3 ? "WhatsApp" : "Done"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--primary-color)] transition-all duration-700 ease-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-10 border border-gray-50">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 animate-fadeIn">
                            {error}
                        </div>
                    )}

                    {step === 0 && (
                        <div className="animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 bg-blue-50 text-[var(--primary-color)] px-4 py-2 rounded-full text-xs font-bold mb-4">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Premium Partner Status
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome to {plan?.toUpperCase()}!</h2>
                                <p className="text-gray-500">Your Soro Premium payment has been verified. You now have access to unlimited messaging and advanced AI tools.</p>
                                {paymentRef && <p className="mt-2 text-[10px] font-mono text-gray-400">Reference: {paymentRef}</p>}
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4 border border-gray-100">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-[var(--primary-color)]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Unlimited Meta Messaging</h4>
                                        <p className="text-xs text-gray-500">Send thousands of messages without restrictions.</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4 border border-gray-100">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Verified Partner Badge</h4>
                                        <p className="text-xs text-gray-500">Enhanced trust for your WhatsApp Business account.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full bg-[var(--primary-color)] text-white py-4 rounded-2xl font-bold hover:bg-[var(--accent-color)] transition-all shadow-xl shadow-blue-500/20"
                            >
                                Start Setup →
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Business Profile</h2>
                                <p className="text-gray-500">Tell us about your organization to optimize your AI assistant.</p>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={businessData.name}
                                        onChange={handleInputChange}
                                        placeholder="Soro"
                                        required
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Business Type</label>
                                    <select
                                        name="type"
                                        value={businessData.type}
                                        onChange={handleInputChange}
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                    >
                                        <option value="ECOMMERCE">E-commerce & Retail</option>
                                        <option value="REAL_ESTATE">Real Estate</option>
                                        <option value="EDUCATION">Education</option>
                                        <option value="HEALTHCARE">Healthcare</option>
                                        <option value="FINANCE">Finance</option>
                                        <option value="TECHNOLOGY">Technology</option>
                                        <option value="HOSPITALITY">Hospitality</option>
                                        <option value="SERVICES">Services</option>
                                        <option value="RESTAURANT">Restaurant</option>
                                        <option value="RETAIL">Retail</option>
                                        <option value="ARTISAN">Artisan</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={businessData.description}
                                        onChange={handleInputChange}
                                        placeholder="Short description of your business..."
                                        className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all min-h-[100px]"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-[var(--primary-color)] text-white py-4 rounded-2xl font-bold hover:bg-[var(--accent-color)] transition-all shadow-xl shadow-blue-500/20"
                                    >
                                        Save & Continue →
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn relative">
                            {/* Sub-progress indicator */}
                            <div className="flex gap-1 mb-8">
                                {KNOWLEDGE_BASE_QUESTIONS.map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${subStep >= i ? "bg-[var(--primary-color)]" : "bg-gray-100"}`} />
                                ))}
                            </div>

                            <div className="flex gap-4 mb-6 items-start">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🤖</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 relative">
                                    <p className="text-sm text-gray-700 leading-relaxed italic">
                                        "{KNOWLEDGE_BASE_QUESTIONS[subStep].guide}"
                                    </p>
                                    <div className="absolute -left-2 top-0 w-2 h-2 bg-gray-50 border-l border-t border-gray-100 -rotate-45" />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-8 animate-slideUp">
                                <label className="block text-xl font-black text-gray-900 mb-4">
                                    {KNOWLEDGE_BASE_QUESTIONS[subStep].label}
                                </label>

                                <textarea
                                    name={KNOWLEDGE_BASE_QUESTIONS[subStep].id}
                                    value={(businessData as any)[KNOWLEDGE_BASE_QUESTIONS[subStep].id]}
                                    onChange={handleInputChange}
                                    placeholder={KNOWLEDGE_BASE_QUESTIONS[subStep].placeholder}
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-5 text-gray-900 text-base focus:ring-4 focus:ring-blue-50 outline-none transition-all min-h-[120px] mb-4"
                                />

                                <div className="flex flex-wrap gap-2">
                                    {KNOWLEDGE_BASE_QUESTIONS[subStep].suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => {
                                                const currentId = KNOWLEDGE_BASE_QUESTIONS[subStep].id;
                                                const currentValue = (businessData as any)[currentId];
                                                const newValue = currentValue
                                                    ? `${currentValue}, ${suggestion}`
                                                    : suggestion;
                                                setBusinessData(prev => ({ ...prev, [currentId]: newValue }));
                                            }}
                                            className="px-3 py-1.5 bg-blue-50 text-[var(--primary-color)] rounded-full text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100/50"
                                        >
                                            + {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={() => {
                                        if (subStep > 0) setSubStep(s => s - 1);
                                        else setStep(1);
                                    }}
                                    className="px-6 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                                >
                                    ← {subStep === 0 ? "Back to Profile" : "Previous Question"}
                                </button>
                                <button
                                    onClick={() => {
                                        const currentId = KNOWLEDGE_BASE_QUESTIONS[subStep].id;
                                        if (!(businessData as any)[currentId] && currentId !== 'commonQuestions') {
                                            setError("Please provide an answer before continuing.");
                                            return;
                                        }
                                        setError(null);
                                        if (subStep < KNOWLEDGE_BASE_QUESTIONS.length - 1) {
                                            setSubStep(s => s + 1);
                                        } else {
                                            handleSaveBusiness();
                                        }
                                    }}
                                    disabled={isSaving}
                                    className="bg-[var(--primary-color)] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[var(--accent-color)] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        subStep < KNOWLEDGE_BASE_QUESTIONS.length - 1 ? "Next Question →" : "Continue to WhatsApp →"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fadeIn">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Connect WhatsApp</h2>
                                <p className="text-gray-500">The final step: connect your Meta Business account to start messaging.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Meta Embedded Signup</h4>
                                            <p className="text-xs text-gray-500 italic">Official WhatsApp Integration</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            Select your Business Manager
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            Link your Phone Number
                                        </li>
                                    </ul>
                                    <MetaEmbeddedSignup
                                        onSuccess={handleMetaSuccess}
                                        onError={handleMetaError}
                                    />
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    ← Back to Knowledge Base
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[var(--primary-color)] mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Account Ready!</h2>
                                <p className="text-gray-500">Your profile is complete and WhatsApp is linked.</p>
                            </div>

                            <section className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mb-8 max-h-[400px] overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase">Business Profile</p>
                                        <p className="text-sm font-bold text-gray-800">{businessData.name}</p>
                                        <p className="text-xs text-gray-500">{businessData.type}</p>
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase">WhatsApp Connection</p>
                                        <p className="text-xs text-gray-500 font-mono">WABA: {whatsappConfig.wabaId}</p>
                                        <p className="text-xs text-gray-500 font-mono">Phone: {whatsappConfig.phoneNumberId}</p>
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase">Knowledge Base</p>
                                        <div className="mt-2 space-y-2">
                                            {['whatYouOffer', 'pricing', 'availability'].map(key => (
                                                <div key={key} className="text-[11px] text-gray-600">
                                                    <span className="font-bold opacity-50">{key}:</span> {(businessData as any)[key].substring(0, 50)}...
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <button
                                onClick={handleComplete}
                                disabled={!whatsappConfig.wabaId && !businessData.name}
                                className="w-full bg-[var(--primary-color)] text-white py-4 rounded-2xl font-bold hover:bg-[var(--accent-color)] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Finish Setup & Enter Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}


export default function Onboarding() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <OnboardingContent />
            </Suspense>

            <Footer />
        </>
    );
}
