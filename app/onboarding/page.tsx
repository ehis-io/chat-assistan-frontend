"use client";

import Navbar from "../component/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        type: "RESTAURANT",
        description: "",
        whatYouOffer: "",
        contactInfo: "",
        availability: "",
        pricing: "",
        deliveryOptions: "",
        policies: "",
        commonQuestions: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting Business Data:", formData);
        // Mimic API call
        setTimeout(() => {
            router.push("/dashboard");
        }, 1000);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[var(--background-color)] px-4 py-24">
                <main className="w-full max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 animate-fadeInSlow">

                    <div className="p-8 md:p-10">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-[var(--text-color)] mb-3">Setup Your Business</h1>
                            <p className="text-[var(--text-muted)]">Tell us about your business so our AI can help you better.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Basic Info Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4 border-b pb-2">Basic Information</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Business Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Mama Rosa's Pizza"
                                            required
                                            className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Business Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all bg-white"
                                        >
                                            <option value="RESTAURANT">Restaurant</option>
                                            <option value="RETAIL">Retail</option>
                                            <option value="SERVICE">Service</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Family-owned pizza shop serving the community since 1990."
                                        rows={3}
                                        className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>
                            </section>

                            {/* Offerings Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4 border-b pb-2">Offerings & Pricing</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">What You Offer</label>
                                        <textarea
                                            name="whatYouOffer"
                                            value={formData.whatYouOffer}
                                            onChange={handleChange}
                                            placeholder="We sell pizza, pasta, and salads made fresh daily."
                                            rows={2}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Pricing Overview</label>
                                        <textarea
                                            name="pricing"
                                            value={formData.pricing}
                                            onChange={handleChange}
                                            placeholder="Pepperoni Pizza: $12, Cheese Pizza: $10..."
                                            rows={2}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Operations Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4 border-b pb-2">Operations</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Contact Info</label>
                                        <input
                                            type="text"
                                            name="contactInfo"
                                            value={formData.contactInfo}
                                            onChange={handleChange}
                                            placeholder="555-1234, 123 Main St"
                                            className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Availability / Hours</label>
                                        <input
                                            type="text"
                                            name="availability"
                                            value={formData.availability}
                                            onChange={handleChange}
                                            placeholder="Mon-Fri 11am-10pm"
                                            className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Delivery Options</label>
                                    <input
                                        type="text"
                                        name="deliveryOptions"
                                        value={formData.deliveryOptions}
                                        onChange={handleChange}
                                        placeholder="Delivery $3, free over $25"
                                        className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </section>

                            {/* Policies & FAQ */}
                            <section>
                                <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4 border-b pb-2">Policies & FAQ</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Policies</label>
                                        <textarea
                                            name="policies"
                                            value={formData.policies}
                                            onChange={handleChange}
                                            placeholder="Full refund if order is wrong..."
                                            rows={2}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-color)] mb-1">Common Questions</label>
                                        <textarea
                                            name="commonQuestions"
                                            value={formData.commonQuestions}
                                            onChange={handleChange}
                                            placeholder="Do you deliver? Yes..."
                                            rows={2}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="min-w-[200px] rounded-xl bg-[var(--primary-color)] py-3.5 text-white font-semibold shadow-lg shadow-[var(--primary-color)]/30 hover:shadow-xl hover:shadow-[var(--primary-color)]/40 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Save & Continue
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
