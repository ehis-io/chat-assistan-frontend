"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Template {
    id: string;
    name: string;
    category: string;
    language: string;
    status: "APPROVED" | "PENDING" | "REJECTED";
    content: string;
}

const initialTemplates: Template[] = [
    {
        id: "1",
        name: "welcome_message",
        category: "UTILITY",
        language: "en_US",
        status: "APPROVED",
        content: "Hello {{1}}, welcome to our service! We are happy to have you."
    },
    {
        id: "2",
        name: "order_confirmation",
        category: "TRANSACTIONAL",
        language: "en_US",
        status: "APPROVED",
        content: "Your order {{1}} has been confirmed. It will be delivered by {{2}}."
    }
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: "",
        category: "MARKETING",
        language: "en_US",
        content: ""
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call to Meta
        setTimeout(() => {
            const template: Template = {
                id: Math.random().toString(36).substr(2, 9),
                ...newTemplate,
                status: "PENDING"
            };
            setTemplates([template, ...templates]);
            setIsSubmitting(false);
            setIsCreating(false);
            setShowSuccess(true);
            setNewTemplate({ name: "", category: "MARKETING", language: "en_US", content: "" });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Message Templates</h1>
                            <p className="text-sm text-gray-500">Create, manage, and monitor your WhatsApp Business assets</p>
                        </div>
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-[var(--primary-color)]/20 hover:shadow-xl hover:shadow-[var(--primary-color)]/30 transition-all"
                        >
                            Create Template
                        </button>
                    )}
                </div>
            </div>

            <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10">
                {showSuccess && (
                    <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-4 animate-fadeIn">
                        <div className="p-2 bg-green-100 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-green-800 font-bold mb-1">Template Submitted Successfully</h3>
                            <p className="text-green-700 text-sm">Your template has been sent to Meta for review. Status will be updated to 'APPROVED' once verified.</p>
                            <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-100 text-[10px] font-mono text-green-800">
                                HTTP 201 Created<br />
                                WABA_ID: 1234567890<br />
                                STATUS: PENDING_REVIEW
                            </div>
                        </div>
                        <button onClick={() => setShowSuccess(false)} className="text-green-500 hover:text-green-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {isCreating ? (
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeInUp">
                        <div className="p-8 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Create New Message Template</h2>
                            <p className="text-sm text-gray-500">Templates are required for outbound business messaging.</p>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. promotional_offer"
                                        className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                        value={newTemplate.name}
                                        onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    />
                                    <p className="mt-1 text-[10px] text-gray-400">Lowercase letters and underscores only.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white"
                                        value={newTemplate.category}
                                        onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                    >
                                        <option value="MARKETING">Marketing (Promotion/Offers)</option>
                                        <option value="UTILITY">Utility (Account Updates/Alerts)</option>
                                        <option value="AUTHENTICATION">Authentication (OTP codes)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                <select className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-[var(--primary-color)] bg-white">
                                    <option value="en_US">English (US)</option>
                                    <option value="es_ES">Spanish</option>
                                    <option value="fr_FR">French</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content (Body)</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Hello {{1}}, we have a special offer for you!"
                                    className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                                    value={newTemplate.content}
                                    onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                                />
                                <p className="mt-2 text-xs text-gray-400">Use double curly braces for variables: &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; which can be replaced with customer data.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-[#1877F2] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting to Meta...
                                        </>
                                    ) : "Submit for Approval"}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <div key={template.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group border-b-4 border-b-transparent hover:border-b-[var(--primary-color)]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-1">
                                        <span className={`w-fit px-2 py-1 rounded text-[10px] font-bold tracking-tight ${template.status === 'APPROVED' ? 'bg-green-100 text-green-700 uppercase' :
                                            template.status === 'PENDING' ? 'bg-blue-100 text-blue-700 uppercase' : 'bg-red-100 text-red-700 uppercase'
                                            }`}>
                                            {template.status}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-400">{template.category}</span>
                                    </div>
                                    <button className="p-2 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-50 bg-transparent">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-3">{template.name}</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                                    <p className="text-sm text-gray-600 line-clamp-4 italic scrollbar-hide">
                                        "{template.content}"
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.827-5.802" />
                                        </svg>
                                        <span className="text-xs text-gray-500 font-medium">{template.language}</span>
                                    </div>
                                    <button className="text-[var(--primary-color)] text-xs font-bold px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
