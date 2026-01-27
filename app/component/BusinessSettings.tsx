"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/utils/auth";

interface BusinessSettingsProps {
    business: any;
    onUpdate: (updatedBusiness: any) => void;
    onClose: () => void;
}

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

export default function BusinessSettings({ business, onUpdate, onClose }: BusinessSettingsProps) {
    const [formData, setFormData] = useState({
        name: business?.name || "",
        type: business?.type || "ECOMMERCE",
        description: business?.description || "",
        whatYouOffer: business?.what_you_offer || business?.knowledge_base?.whatYouOffer || "",
        contactInfo: business?.contact_info || business?.knowledge_base?.contactInfo || "",
        availability: business?.availability || business?.knowledge_base?.availability || "",
        pricing: business?.pricing || business?.knowledge_base?.pricing || "",
        deliveryOptions: business?.delivery_options || business?.knowledge_base?.deliveryOptions || "",
        policies: business?.policies || business?.knowledge_base?.policies || "",
        commonQuestions: business?.common_questions || business?.knowledge_base?.commonQuestions || "",
        bank_name: business?.bank_name || "",
        account_name: business?.account_name || "",
        account_number: business?.account_number || "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSuggestion = (id: string, suggestion: string) => {
        const currentValue = (formData as any)[id];
        const newValue = currentValue
            ? `${currentValue}, ${suggestion}`
            : suggestion;
        setFormData(prev => ({ ...prev, [id]: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const token = getToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

            const response = await fetch(`${baseUrl}/business/${business.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update business');
            }

            const updatedData = await response.json();
            setMessage({ type: 'success', text: 'Business settings updated successfully! AI knowledge is being refreshed.' });
            onUpdate(updatedData);

            // Auto hide message after 3 seconds
            setTimeout(() => setMessage(null), 3000);

        } catch (error: any) {
            console.error("Update failed:", error);
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const renderKnowledgeField = (config: typeof KNOWLEDGE_BASE_QUESTIONS[0]) => (
        <div key={config.id} className="space-y-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex gap-4 items-start mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100 relative">
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                        "{config.guide}"
                    </p>
                </div>
            </div>

            <label className="block text-sm font-bold text-gray-700">
                {config.label}
            </label>

            <textarea
                name={config.id}
                value={(formData as any)[config.id]}
                onChange={handleChange}
                placeholder={config.placeholder}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-900 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all min-h-[100px] mb-3"
            />

            <div className="flex flex-wrap gap-2">
                {config.suggestions.map((suggestion) => (
                    <button
                        key={suggestion}
                        type="button"
                        onClick={() => addSuggestion(config.id, suggestion)}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold hover:bg-blue-100 transition-colors border border-blue-100/50"
                    >
                        + {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Business Settings</h2>
                    <p className="text-sm text-gray-500">Update your business profile and AI knowledge base</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <span className="font-medium text-sm">{message.text}</span>
                    </div>
                )}

                <form id="business-settings-form" onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
                    {/* Basic Info */}
                    <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Business Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Business Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                                    required
                                >
                                    <option value="ECOMMERCE">E-commerce & Retail</option>
                                    <option value="SERVICES">Services</option>
                                    <option value="RESTAURANT">Restaurant</option>
                                    <option value="REAL_ESTATE">Real Estate</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-gray-700">General Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* AI Knowledge Source Fields */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 px-2">
                            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Knowledge Center</h3>
                            <div className="h-[1px] flex-1 bg-indigo-100"></div>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Auto-Refresh Enabled</span>
                        </div>

                        {KNOWLEDGE_BASE_QUESTIONS.map(renderKnowledgeField)}
                    </section>

                    {/* Bank Transfer Details */}
                    <section className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            Billing Context
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase opacity-80 letter-spacing-widest">Bank Name</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={formData.bank_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Zenith Bank"
                                    className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-2xl focus:bg-white focus:text-indigo-900 outline-none transition-all placeholder:text-white/40 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase opacity-80 letter-spacing-widest">Account Name</label>
                                <input
                                    type="text"
                                    name="account_name"
                                    value={formData.account_name}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-2xl focus:bg-white focus:text-indigo-900 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase opacity-80 letter-spacing-widest">Account Number</label>
                                <input
                                    type="text"
                                    name="account_number"
                                    value={formData.account_number}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-2xl focus:bg-white focus:text-indigo-900 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </section>
                </form>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all"
                >
                    Discard Changes
                </button>
                <button
                    type="submit"
                    form="business-settings-form"
                    disabled={loading}
                    className={`px-10 py-2.5 text-sm font-black text-white bg-[var(--primary-color)] hover:bg-[var(--accent-color)] rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading && (
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {loading ? 'Propagating Updates...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
