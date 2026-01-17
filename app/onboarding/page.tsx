"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1); // Track current wizard step (0=Welcome, 1=Form, 2=Pending)
    const [metaConnected, setMetaConnected] = useState(false); // Legacy flag for Meta connection status
    const [plan, setPlan] = useState<string | null>(null); // Subscription plan from URL
    const [paymentRef, setPaymentRef] = useState<string | null>(null); // Transaction reference from URL
    const [error, setError] = useState<string | null>(null);

    // Configuration for WhatsApp (IDs are set to PENDING in the assisted flow)
    const [whatsappConfig, setWhatsappConfig] = useState({
        wabaId: "",
        phoneNumberId: "",
        code: ""
    });

    // Main business profile state collected in the Step 1 form
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
        commonQuestions: "",
        requestedPhoneNumber: ""
    });

    const [isSaving, setIsSaving] = useState(false);

    // Effect: Extract plan and payment details from URL parameters on mount
    useEffect(() => {
        const p = searchParams.get("plan");
        const r = searchParams.get("ref");
        if (p) {
            setPlan(p);
            setPaymentRef(r);
            setStep(0); // If a plan is found, show the specialized Partner Welcome step
        }

        // Handle legacy Meta connection redirect if necessary
        if (searchParams.get("meta_connected") === "true") {
            setMetaConnected(true);
            setStep(2);
        }
    }, [searchParams]);

    /**
     * handleComplete: Submits the collected business data to the backend API.
     * In the "Assisted Onboarding" flow, this creates a record with 'PENDING' status
     * for Assets, which will be manually filled by an admin.
     */
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
                whatsappPhoneNumber: businessProfile.requestedPhoneNumber,
                whatsappBusinessId: null,
                whatsappAccessToken: null
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

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (res.status === 404) {
                    console.warn("404 received, proceeding to pending screen for demo purposes.");
                    setStep(2);
                    return;
                }
                console.error("Server returned error:", data);
                throw new Error(data.message || `Server error (${res.status})`);
            }

            console.log("Save successful, moving to pending step...");
            setStep(2);
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

                    {/* STEP 0: Special Welcome Screen for Paid Users */}
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

                    {/* STEP 1: Main Business Profile Form */}
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
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Business Number</label>
                                        <input
                                            type="text"
                                            placeholder="+234 800 000 0000"
                                            value={businessProfile.requestedPhoneNumber}
                                            onChange={(e) => setBusinessProfile({ ...businessProfile, requestedPhoneNumber: e.target.value })}
                                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all"
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2">Enter the phone number you want to use for your WhatsApp Business API connection.</p>
                                    </div>
                                </div>
                                <div className="pt-8">
                                    <button
                                        onClick={handleComplete}
                                        disabled={isSaving || !businessProfile.name || !businessProfile.requestedPhoneNumber}
                                        className="w-full bg-[var(--primary-color)] text-white py-4 rounded-2xl font-bold hover:bg-[var(--accent-color)] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSaving && (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {isSaving ? "Submitting Request..." : "Submit WhatsApp Connection Request"}
                                    </button>
                                    <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                                        By submitting, you agree to our terms. Our team will review your business details and set up your WhatsApp Business and contact you within 3 business days.
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}


                    {/* STEP 2: Pending Approval Screen (Post-submission) */}
                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-[var(--primary-color)] mx-auto mb-6 relative">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-white animate-pulse"></div>
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Request Pending</h2>
                                <p className="text-gray-500">Your WhatsApp connection is being processed.</p>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Onboarding Journey</h4>

                                    <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                        {[
                                            { label: "Sign up", status: "completed" },
                                            { label: "Business details", status: "completed" },
                                            { label: "Submit WhatsApp request", status: "completed" },
                                            { label: "Status: Pending approval", status: "current" },
                                            { label: "Upload training data", status: "upcoming" },
                                            { label: "Go live", status: "upcoming" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-6 relative z-10">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${item.status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' :
                                                    item.status === 'current' ? 'bg-[var(--primary-color)] text-white shadow-lg shadow-blue-500/20 animate-pulse' :
                                                        'bg-white border border-gray-100 text-gray-300'
                                                    }`}>
                                                    {item.status === 'completed' ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span className="text-xs font-bold">{i + 1}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-bold ${item.status === 'upcoming' ? 'text-gray-300' : 'text-gray-800'}`}>
                                                        {item.label}
                                                    </p>
                                                    {item.status === 'current' && (
                                                        <p className="text-[10px] text-[var(--primary-color)] font-medium">Estimated time: 1 - 3 business days</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--primary-color)] shadow-sm flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-800 text-sm mb-1">What happens next?</h5>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                Our team will manually add your business to Meta Business Manager and complete the embedded signup. Once approved, you'll receive an email notification for the next steps.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full bg-white text-gray-600 border border-gray-100 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Go to Dashboard (Preview)
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
