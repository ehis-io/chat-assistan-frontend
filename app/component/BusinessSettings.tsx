"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/utils/auth";

interface BusinessSettingsProps {
    business: any;
    onUpdate: (updatedBusiness: any) => void;
    onClose: () => void;
}

export default function BusinessSettings({ business, onUpdate, onClose }: BusinessSettingsProps) {
    const [formData, setFormData] = useState({
        name: business?.name || "",
        type: business?.type || "ECOMMERCE",
        description: business?.description || "",
        whatYouOffer: business?.what_you_offer || "",
        contactInfo: business?.contact_info || "",
        availability: business?.availability || "",
        pricing: business?.pricing || "",
        deliveryOptions: business?.delivery_options || "",
        policies: business?.policies || "",
        commonQuestions: business?.common_questions || "",
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
            <div className="flex-1 overflow-y-auto p-6">
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
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}

                <form id="business-settings-form" onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Business Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Business Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    required
                                >
                                    <option value="ECOMMERCE">Ecommerce & Retail</option>
                                    <option value="SERVICES">Services</option>
                                    <option value="RESTAURANT">Restaurant</option>
                                    <option value="REAL_ESTATE">Real Estate</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">General Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* AI Knowledge Source Fields */}
                    <section>
                        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 italic">AI Knowledge Details (Triggers Refresh)</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 font-bold flex items-center gap-2 text-indigo-900">
                                    What You Offer
                                    <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded text-indigo-700">Soro Knowledge</span>
                                </label>
                                <textarea
                                    name="whatYouOffer"
                                    value={formData.whatYouOffer}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="List your products or services here..."
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Pricing Information</label>
                                    <textarea
                                        name="pricing"
                                        value={formData.pricing}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Availability / Hours</label>
                                    <textarea
                                        name="availability"
                                        value={formData.availability}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Contact Information (for Customers)</label>
                                <textarea
                                    name="contactInfo"
                                    value={formData.contactInfo}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Common Questions & Answers</label>
                                <textarea
                                    name="commonQuestions"
                                    value={formData.commonQuestions}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Q: Do you deliver? A: Yes, within Lagos..."
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Bank Transfer Details */}
                    <section className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50">
                        <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            Bank Transfer Details for Invoices
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={formData.bank_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Zenith Bank"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Account Name</label>
                                <input
                                    type="text"
                                    name="account_name"
                                    value={formData.account_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Account Number</label>
                                <input
                                    type="text"
                                    name="account_number"
                                    value={formData.account_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </section>
                </form>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="business-settings-form"
                    disabled={loading}
                    className={`px-8 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-md flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading && (
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {loading ? 'Saving Changes...' : 'Save All Settings'}
                </button>
            </div>
        </div>
    );
}
