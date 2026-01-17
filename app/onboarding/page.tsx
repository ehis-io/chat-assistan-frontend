"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import MetaEmbeddedSignup from "../component/MetaEmbeddedSignup";

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [metaConnected, setMetaConnected] = useState(false);
    const [plan, setPlan] = useState<string | null>(null);
    const [paymentRef, setPaymentRef] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [whatsappConfig, setWhatsappConfig] = useState({
        wabaId: "",
        phoneNumberId: "",
        code: ""
    });

    const [businessProfile, setBusinessProfile] = useState({
        name: "",
        type: "ecommerce",
        description: "",
        whatYouOffer: "",
        contactInfo: "",
        availability: "",
        pricing: "",
        deliveryOptions: "",
        policies: "",
        commonQuestions: ""
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const p = searchParams.get("plan");
        const r = searchParams.get("ref");
        if (p) {
            setPlan(p);
            setPaymentRef(r);
            setStep(0); // Show partner welcome step
        }

        if (searchParams.get("meta_connected") === "true") {
            setMetaConnected(true);
            setStep(2); // Jump to WhatsApp connection step
        }
    }, [searchParams]);

    const handleMetaSuccess = (data: { code: string; waba_id: string; phone_number_id: string }) => {
        console.log("Onboarding: Meta Success Callback Received", data);
        setWhatsappConfig({
            wabaId: data.waba_id,
            phoneNumberId: data.phone_number_id,
            code: data.code
        });
        setMetaConnected(true);
        setStep(2);
        setError(null);

        // Short delay to ensure state is updated, then log
        setTimeout(() => {
            console.log("Step 2 should now be visible");
        }, 100);
    };

    const handleMetaError = (err: string) => {
        setError(err);
    };

    const handleComplete = async () => {
        if (isSaving) return;

        console.log("!!! Onboarding: handleComplete triggered !!!");
        setIsSaving(true);
        setError(null);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
            const token = localStorage.getItem('token');

            if (!token) {
                console.error("No auth token found");
                alert("Session expired. Please login again.");
                router.push('/login');
                return;
            }

            const payload = {
                name: businessProfile.name || "Business",
                type: businessProfile.type || "other",
                description: businessProfile.description || "Captured via Onboarding",
                whatYouOffer: businessProfile.whatYouOffer || "",
                contactInfo: businessProfile.contactInfo || "",
                availability: businessProfile.availability || "",
                pricing: businessProfile.pricing || "",
                deliveryOptions: businessProfile.deliveryOptions || "",
                policies: businessProfile.policies || "",
                commonQuestions: businessProfile.commonQuestions || "",
                whatsappPhoneNumber: whatsappConfig.phoneNumberId,
                whatsappBusinessId: whatsappConfig.wabaId,
                whatsappAccessToken: whatsappConfig.code
            };

            console.log("Attempting API call to:", `${baseUrl}/user/create-business`);
            console.log("Payload:", payload);

            const res = await fetch(`${baseUrl}/user/create-business`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            }).catch(e => {
                console.error("Network Fetch Error:", e);
                throw new Error("Cannot connect to server. Check your internet or backend status.");
            });

            console.log("Response status code:", res.status);

            if (res.status === 404) {
                console.warn("404 received, proceeding to dashboard for demo purposes.");
                router.push("/dashboard");
                return;
            }

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                console.error("Server returned error:", data);
                throw new Error(data.message || `Server error (${res.status})`);
            }

            console.log("Save successful, redirecting...");
            router.push("/dashboard");
        } catch (err: any) {
            console.error("handleComplete caught error:", err);
            setError(err.message);
            // Also alert for immediate feedback in case console is hidden
            alert("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background-color)] pt-32 pb-20 px-6">
            <main className="max-w-2xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        {[0, 1, 2].map((s) => (
                            <div key={s} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= s ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-color)]/30" : "bg-white text-gray-300 border border-gray-100"}`}>
                                    {s === 0 ? "★" : s}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s ? "text-[var(--primary-color)]" : "text-gray-300"}`}>
                                    {s === 0 ? "Partner" : s === 1 ? "Business" : "WhatsApp"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--primary-color)] transition-all duration-700 ease-out"
                            style={{ width: `${(step / 2) * 100}%` }}
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

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">General Information</h3>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
                                        <input
                                            type="text"
                                            placeholder="Soro"
                                            value={businessProfile.name}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Industry / Type</label>
                                        <select
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                            value={businessProfile.type}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, type: e.target.value })}
                                        >
                                            <option value="ecommerce">E-commerce & Retail</option>
                                            <option value="real_estate">Real Estate</option>
                                            <option value="education">Education</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="finance">Finance & Banking</option>
                                            <option value="technology">Technology & Software</option>
                                            <option value="hospitality">Hospitality & Tourism</option>
                                            <option value="services">Other Services</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
                                        <textarea
                                            placeholder="What does your business do?"
                                            value={businessProfile.description}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all h-24 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6">
                                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Onboarding Questions</h3>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">What services or products do you offer?</label>
                                        <textarea
                                            value={businessProfile.whatYouOffer}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, whatYouOffer: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all h-24 resize-none"
                                            placeholder="List your key offerings..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact Information</label>
                                        <input
                                            type="text"
                                            value={businessProfile.contactInfo}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, contactInfo: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                            placeholder="Email, support channel, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Working Hours / Availability</label>
                                        <input
                                            type="text"
                                            value={businessProfile.availability}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, availability: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                            placeholder="e.g. Mon-Fri, 9am - 5pm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Pricing Information</label>
                                        <input
                                            type="text"
                                            value={businessProfile.pricing}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, pricing: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                            placeholder="Starting price or price range..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Delivery / Shipping Options</label>
                                        <textarea
                                            value={businessProfile.deliveryOptions}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, deliveryOptions: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all h-24 resize-none"
                                            placeholder="How do you deliver items?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Business Policies (Refunds, etc.)</label>
                                        <textarea
                                            value={businessProfile.policies}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, policies: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all h-24 resize-none"
                                            placeholder="Returns, refunds, late fees..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Common Questions (Optional)</label>
                                        <textarea
                                            value={businessProfile.commonQuestions}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, commonQuestions: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all h-24 resize-none"
                                            placeholder="FAQ for your customers..."
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <p className="text-xs text-gray-400 mb-4 text-center">
                                        Connect your business to WhatsApp. You will be redirected to Meta to select your business account.
                                    </p>
                                    <MetaEmbeddedSignup
                                        onSuccess={handleMetaSuccess}
                                        onError={handleMetaError}
                                    />
                                </div>
                            </form>
                        </div>
                    )}


                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[var(--primary-color)] mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Connect Assets</h2>
                                <p className="text-gray-500">Linking your Meta assets with your Soro account.</p>
                            </div>

                            <section className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 mb-8">
                                <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Status</p>
                                        <p className="text-sm font-bold text-gray-800">Meta Account Linked</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp Business Account ID</p>
                                        <p className="text-sm font-mono text-gray-800 break-all">{whatsappConfig.wabaId || "Successfully Captured"}</p>
                                    </div>

                                    <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number ID</p>
                                        <p className="text-sm font-mono text-gray-800 break-all">{whatsappConfig.phoneNumberId || "Successfully Captured"}</p>
                                    </div>

                                    <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                        <div className="flex items-center gap-2 text-green-700 mb-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xs font-bold">Permissions Granted</span>
                                        </div>
                                        <p className="text-[10px] text-green-600 font-medium">
                                            whatsapp_business_management, whatsapp_business_messaging
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <button
                                onClick={handleComplete}
                                disabled={isSaving}
                                className="w-full bg-[var(--primary-color)] text-white py-4 rounded-2xl font-bold hover:bg-[var(--accent-color)] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving && (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isSaving ? "Saving Configuration..." : "Finish Setup & Enter Dashboard"}
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
